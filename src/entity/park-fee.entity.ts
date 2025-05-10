import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('park_fee')
export class ParkFee extends Base {
  @Column({ comment: '停车场编号' })
  park: string

  @Column({ comment: '单位：元/小时' })
  fee: number

  @Column({ comment: '开始事件：日小时' })
  start: Date

  @Column({ comment: '结束时间：日小时' })
  end: Date
}