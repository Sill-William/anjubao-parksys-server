
import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('user_role')
export class UserRole extends Base {
  @Column({ comment: '用户编号' })
  user: string

  @Column({ comment: '角色编号' })
  role: string

  @Column({ nullable: true, comment: '如果是停车场管理员，需要这个补丁字段确定管理哪一个停车场。留空则管理全局' })
  plugin: string
}