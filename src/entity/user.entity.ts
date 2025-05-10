import { Column, Entity } from 'typeorm'
import { Base } from './base.entity'

@Entity('user')
export class User extends Base {
  @Column({ comment: '用户名' })
  name: string

  @Column({ nullable: true, comment: '邮箱' })
  email: string

  @Column({ nullable: true, comment: '手机号' })
  phone: string

  @Column({ comment: '加密后密码' })
  password: string

  @Column({ nullable: true, default: '', comment: '头像链接',  })
  avatar: string

  @Column({ nullable: true, default: 1, comment: '0: 男, 1: 女' })
  gender: number

  @Column({ nullable: true, comment: '生日' })
  birthday: Date

  @Column({ default: 0, comment: '是否封禁：0: 否, 1: 是' })
  restricted: number
}