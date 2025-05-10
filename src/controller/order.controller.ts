import { Body, Controller, Get, Inject, Logger, Patch, Post, Put, Query, Render, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, MessagePattern, Payload } from "@nestjs/microservices";
import { Request } from "express";
import { OrderQueryDto } from "src/entity/dto/order-query.dto";
import { OrderUpdateDto } from "src/entity/dto/order-update.dto";
import { OrderDto } from "src/entity/dto/order.dto";
import { OrderService } from "src/service/order.service";
import { OperationFactory } from "src/util/factory/operation.factory";

@Controller('/order')
export class OrderController {
  private readonly log: Logger = new Logger(OrderController.name)

  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
    @Inject('MQ_SERVICE') private readonly mqService: ClientProxy,
  ) {
  }

  @Get('/')
  @Render('module/order')
  async manager() {
    return {}
  }

  @Get('/all')
  async all(@Req() req: Request, @Query() orderQueryDto: OrderQueryDto) {
    let user = req['user']
    if (!user) {
      return {
        code: 1,
        message: '用户未登录'
      }
    }
    let orders = []
    if (user.role.indexOf('admin') === -1) {
      orderQueryDto.user = user.id || user.sub
      orders = await this.orderService.getOrders(orderQueryDto)
    } else {
      if (!!user.plugin) {
        orderQueryDto.park = user.plugin
      } 
      orders = await this.orderService.getOrders(orderQueryDto)
    }
    return {
      code: 0,
      data: orders
    }
  }

  @Get('/latest')
  async latest(@Req() req: Request, @Query() orderQueryDto: OrderQueryDto) {
    let user = req['user']
    if (!user) {
      return {
        code: 1,
        message: '用户未登录'
      }
    }
    orderQueryDto.user = user.id || user.sub
    return {
      code: 0,
      data: await this.orderService.getLatestOrder(orderQueryDto)
    }
  }

  @Post('/apply')
  async apply(@Req() req: Request, @Body() orderDto: OrderDto) {
    let user = req['user']
    if (!user) {
      return {
        attached: false,
        message: '用户未登录'
      }
    }
    orderDto.user = user.id || user.sub
    return await OperationFactory.doOperInCtr(async () => {
      const result = this.mqService.send('create_order', orderDto).subscribe();
      this.log.debug(result)
    })
  }

  /**
   * 更新订单状态
   * @param orderDto 
   * @returns 
   */
  @Patch('/update')
  async update(@Body() orderUpdateDto: OrderUpdateDto) {
    // TODO: 如果订单状态改为出场，需要更新车位状态、计算停车费用
    return await OperationFactory.doOperInCtr(async () => {
      const result = this.mqService.send('update_order', orderUpdateDto).subscribe();
      this.log.debug(result)
    })
  }

  /**
   * 更新订单状态
   * @param orderDto 
   * @returns 
   */
  @Put('/update')
  async updateByPut(@Body() orderUpdateDto: OrderUpdateDto) {
    // TODO: 如果订单状态改为出场，需要更新车位状态、计算停车费用
    return await OperationFactory.doOperInCtr(async () => {
      const result = this.mqService.send('update_order', orderUpdateDto).subscribe();
      this.log.debug(result)
    })
  }

  /**
   * 消费订单消息
   * @param orderDto 
   * @returns 
   */
  @MessagePattern('create_order')
  async applyFromMq(@Payload() orderDto: OrderDto) {
    console.debug('收到订单消息', orderDto)
    try {
      await this.orderService.create(orderDto)
    } catch(e) {
      this.log.error(e)
    }
  }
 
  @MessagePattern('update_order')
  async updateFromMq(@Payload() orderUpdateDto: OrderUpdateDto) {
    console.debug('收到订单消息', orderUpdateDto)
    try {
      await this.orderService.update(orderUpdateDto);
      return {
        attached: true,
      }
    } catch (e) {
      return {
        attached: false,
      }
    }
  }
}