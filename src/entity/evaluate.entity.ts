import { Base } from "./base.entity"
import { Column, Entity } from "typeorm"

@Entity('evaluate')
export class Evaluate extends Base {
  @Column({ comment: '订单编号' })
  order: string

  @Column({ comment: '评分' })
  score: number

  @Column({ comment: '评论内容' })
  comment: string
}