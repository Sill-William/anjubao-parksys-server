import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('feedback')
export class Feedback extends Base {
  @Column({ comment: '用户编号' })
  user: string

  @Column({ comment: '反馈内容' })
  content: string
}