import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EvaluateQueryDto } from "src/entity/dto/evaluate-query.dto";
import { EvaluateDto } from "src/entity/dto/evaluate.dto";
import { Evaluate } from "src/entity/evaluate.entity";
import { Repository } from "typeorm";
import { OrderService } from "./order.service";
import { Order } from "src/entity/order.entity";
import { User } from "src/entity/user.entity";
import { Park } from "src/entity/park.entity";

@Injectable()
export class EvaluateService {
  private readonly log: Logger = new Logger(EvaluateService.name)
  constructor(
    @InjectRepository(Evaluate) private readonly evaluateRepository: Repository<Evaluate>,
    @Inject(OrderService) private readonly orderService: OrderService,
  ) {}

  async getEvaluate(evaluateQueryDto: EvaluateQueryDto) {
    // const { page, limit, order, score, sort } = evaluateQueryDto
    // let evaluates = await this.evaluateRepository.find({
    //   where: {
    //     score, order
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   order: sort ? { score: 'DESC' } : undefined
    // })
    // return evaluates.map(async evaluate => ({
    //   ...evaluate,
    //   ...this.orderService.getOrderById(evaluate.order)
    // }))
    const { page, limit, user, park, order, score } = evaluateQueryDto
    this.log.debug(`park is ${park}`)
    let qb = this.evaluateRepository.createQueryBuilder('evaluate')
      .leftJoinAndSelect(Order, 'order', 'order.id = evaluate.order')
      .leftJoinAndSelect(User, 'user', 'user.id = order.user')
      .leftJoinAndSelect(Park, 'park', 'park.id = order.park')
    if (!!order) {
      qb = qb.andWhere('order.id = :order', { order })
    }
    if (!!user) {
      qb = qb.andWhere('user.id = :user', { user })
    }
    if (!!park) {
      qb = qb.andWhere('park.id = :park', { park })
      // this.log.debug(qb.getQueryAndParameters())
    }
    if (!!score) {
      qb = qb.andWhere('evaluate.score = :score', { score })
    }
    return await qb.skip(page).take(limit).getRawMany()
  }

  async create(evaluateDto: EvaluateDto) {
    // return await this.evaluateRepository.save(evaluateDto)
    this.evaluateRepository.manager.transaction(async (transactionalEntityManager) => {
      const ev: Evaluate = await transactionalEntityManager.save(Evaluate, evaluateDto)
      await transactionalEntityManager.update(Order, { id: evaluateDto.order }, { evaluate: ev.id })
    })
  }

  async update(id: string, evaluateDto: EvaluateDto) {
    return await this.evaluateRepository.update(id, evaluateDto) 
  }

  async remove(id: string) {
    return await this.evaluateRepository.softDelete(id)
  }
}