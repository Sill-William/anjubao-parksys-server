import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('car')
export class Car extends Base {
  @Column({ unique: true, comment: '车牌号' })
  sign: string

  @Column({ comment: '用户编号' })
  user: string

  @Column({ default: 0, comment: '是否封禁：0: 否, 1: 是' })
  restricted: number
} 