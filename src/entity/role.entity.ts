import { Column, Entity } from "typeorm";
import { Base } from "./base.entity";

@Entity('role')
export class Role extends Base {
  @Column({ comment: '角色名称' })
  name: string

  @Column({ comment: '描述' })
  description: string
}