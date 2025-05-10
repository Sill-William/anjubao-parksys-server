import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ comment: '创建时间' })
  created: Date

  @UpdateDateColumn({ comment: '最近更新时间' })
  updated: Date

  @DeleteDateColumn({ comment: '删除时间' })
  deleted?: Date
}