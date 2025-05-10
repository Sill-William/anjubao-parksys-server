import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderQueryDto } from "src/entity/dto/order-query.dto";
import { OrderUpdateDto } from "src/entity/dto/order-update.dto";
import { OrderDto } from "src/entity/dto/order.dto";
import { Evaluate } from "src/entity/evaluate.entity";
import { Order } from "src/entity/order.entity";
import { Park } from "src/entity/park.entity";
import { Between, Repository } from "typeorm";
import { ParkFeeService } from "./park-fee.service";
import { ParkService } from "./park.service";
import { User } from "src/entity/user.entity";
import { Car } from "src/entity/car.entity";

@Injectable()
export class OrderService {
  private readonly log: Logger = new Logger(OrderService.name)
  private newOrderTimeout: Map<string, NodeJS.Timeout> = new Map()
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @Inject(ParkFeeService) private readonly parkFeeService: ParkFeeService,
    @Inject(ParkService) private readonly parkService: ParkService,
  ) {}

  async getOrders(orderQueryDto: OrderQueryDto) {
    const { 
      page, limit, user, park, status, id,
      bookedStart, bookedEnd,
    } = orderQueryDto;
    let orders = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect(Park, 'park', 'park.id = order.park')
      .leftJoinAndSelect(User, 'user', 'user.id = order.user')
      .leftJoinAndSelect(Car, 'car', 'car.id = order.car')
      .orderBy('order.created', 'DESC')
    if (user) {
      orders = orders.andWhere('order.user = :user', { user })
    }
    if (park) {
      orders = orders.andWhere('order.park = :park', { park })
    }
    if (id) {
      orders = orders.andWhere('order.id = :id', { id })
    }
    return await orders.skip((page - 1) * limit).take(limit).getRawMany()
  }

  async getOrderById(id: string) {
    return await this.orderRepository.findOne({
      where: { id },
    })
  }

  async getLatestOrder(orderQueryDto: OrderQueryDto) {
    const { 
      page, limit, user, park, status, 
      bookedStart, bookedEnd,
    } = orderQueryDto;
    let orders = this.orderRepository.createQueryBuilder('order')
      .orderBy('order.created', 'DESC')
    if (user) {
      orders = orders.andWhere('order.user = :user', { user })
    }
    return await orders.getRawOne()
  }

  async create(orderDto: OrderDto) {
    const park = await this.parkService.select(orderDto.park)
    if (park.rest <= 0) {
      return false
    }
    this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      const order = await transactionalEntityManager.save(Order, orderDto);
      if (!order.id) {
        throw new Error('the process is not successful cause the order id not obtained')
      }
      const timeout = setTimeout(async () => {
        this.remove(order.id)
      }, 1000 * 60 * 10)
      this.newOrderTimeout.set(order.id, timeout)
    })
  }

  async update(orderUpdateDto: OrderUpdateDto) {
    if (!orderUpdateDto.id) {
      return
    }
    this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      const affectedOrder = await transactionalEntityManager.update(Order, orderUpdateDto.id, orderUpdateDto);
      if (affectedOrder.affected > 0) {
        const order = await transactionalEntityManager.findOne(Order, { where: { id: orderUpdateDto.id } })
        if (orderUpdateDto.status === 4 || orderUpdateDto.status === 5) { // when the car out of the park or the order is cancelled/invalided
          // update the rest of the park
          // await transactionalEntityManager.update(Park, order.park, { rest: () =>'rest + 1' })
          this.parkService.release(order.park)
          // calculate the cost
          const cost = await this.calculateCost(order)
          // update the order
          await transactionalEntityManager.update(Order, order.id, { cost })
        }
        let ched = false
        switch (orderUpdateDto.status) {
          case 1: // 已完成预约
            order.bookedAt = new Date()
            this.parkService.lock(order.park)
            this.newOrderTimeout.delete(order.id)
            break
          case 2: // 进行中
            order.inAt = new Date()
            ched = true
            break
          case 3: // 待支付
            order.outAt = new Date()
            const cost = await this.calculateCost(order)
            order.cost = cost
            ched = true
            break
          case 4: // 已完成
            order.paiedAt = new Date()
          case 5:
            order.endAt = new Date()
            // update the rest of the park
            // await transactionalEntityManager.update(Park, order.park, { rest: () =>'rest + 1' })
            this.parkService.release(order.park)
            // calculate the cost
            // update the order
            // await transactionalEntityManager.update(Order, order.id, { cost })
            ched = true
            break
          default:
            break
        }
        if (ched) {
          await transactionalEntityManager.update(Order, order.id, order)
        }        
      }
    })
  }

  /**
   * 删除订单，连带删除订单评论
   * @param id 订单的编号
   */
  async remove(id: string) {
    // return await this.orderRepository.softDelete(id);
    this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softDelete(Order, id);
      const evaluates = (await transactionalEntityManager.find(Evaluate, {
        where: { order: id },
      })).map((evaluate) => evaluate.id);
      await transactionalEntityManager.softDelete(Evaluate, evaluates)
    });
  }

  private async calculateCost(order: Order): Promise<number> {
    if (order.status < 3) {
      return 0
    }
    // get the time begin and end
    const begin = order.inAt
    const end = order.outAt
    return await this.parkFeeService.calculateCost(order.park, begin, end)
  }

}