import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('park')
export class Park extends Base {
  @Column({ comment: '停车场名称' })
  name: string

  @Column({ comment: '停车场地址' })
  address: string

  @Column({ comment: '负责人' })
  responsible: string // 负责人

  @Column({ comment: '联系电话' })
  phone: string // 联系电话

  @Column({ comment: '邮箱' })
  email: string // 邮箱

  @Column({ comment: '描述' })
  description: string

  @Column({ comment: '经度' })
  lat: number

  @Column({ comment: '纬度' })
  lng: number

  @Column({ comment: '停车场最大容量' })
  capacity: number

  @Column({ comment: '停车场剩余容量' })
  rest: number

  @Column({ comment: '停车场预定价格（元/小时）', default: 0 })
  bookingFee: number
}