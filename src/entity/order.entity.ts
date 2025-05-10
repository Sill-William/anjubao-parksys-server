import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('order')
export class Order extends Base {
  @Column({ comment: '停车场编号' })
  park: string

  @Column({ comment: '车辆编号' })
  car: string

  @Column({ comment: '用户编号' })
  user: string

  @Column({ type: 'double', default: 0.0, comment: '总计花费' })
  cost: number

  @Column({ type: 'double', default: 0.0, comment: '预订费用' })
  bookingCost: number

  @Column({
    comment: '0 - 等待支付定金; 1 - 已完成预约; 2 - 进行中（从进入停车场开始计算）; 3 - 待支付; 4 - 已完成; 5 - 已取消/作废'
  })

  status: 0 | 1 | 2 | 3 | 4 | 5

  @Column({ comment: '订单支付定金时间', nullable: true })
  payForBookAt: Date

  @Column({ comment: '订单预订时间', nullable: true })
  bookedAt: Date

  @Column({ comment: '订单预订进入时间', nullable: true })
  applyEnterAt: Date

  @Column({ comment: '机动车进入停车场时间', nullable: true })
  inAt: Date

  @Column({ comment: '机动车离开停车场时间', nullable: true })
  outAt: Date

  @Column({ comment: '订单支付时间', nullable: true })
  paiedAt: Date

  @Column({ comment: '订单结束时间', nullable: true })
  endAt: Date

  @Column({ comment: '订单评价（连接至评价表）', nullable: true })
  evaluate: string

}