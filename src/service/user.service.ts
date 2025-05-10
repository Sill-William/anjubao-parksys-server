import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserQueryDto } from "src/entity/dto/user-query.dto";
import { UserDto } from "src/entity/dto/user.dto";
import { Role } from "src/entity/role.entity";
import { UserRole } from "src/entity/user-role.entity";
import { User } from "src/entity/user.entity";
import { In, Repository, Transaction } from "typeorm";
import { RoleService } from "./role.service";
import * as md5 from "md5";
import { PasswordUpdateDto } from "src/entity/dto/password-update.dto";
import { Car } from "src/entity/car.entity";

@Injectable()
export class UserService {

  private readonly log = new Logger(UserService.name)

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,
    @Inject(RoleService) private readonly roleService: RoleService
  ) {}

  public async getUsers(userQueryDto: UserQueryDto) {
    const roleN = userQueryDto.role
    let role: Array<Role>
    if (!roleN || roleN === 'user') {
      role = [this.roleService.roleByName('user')]
    } else {
      role = [
        this.roleService.roleByName('rootadmin'),
        this.roleService.roleByName('useradmin'),
        this.roleService.roleByName('parkadmin'),
      ].filter(r => !!r)
    }
    const userIds = await this.userRoleRepository.find({
      where: { role: In(role.map(r => r.id)) }
    })
    return await this.userRepository.find({
      take: userQueryDto.limit,
      skip: (userQueryDto.page - 1) * userQueryDto.limit,
      where: { id: userQueryDto.id ?? In(userIds.map(ur => ur.user)), name: userQueryDto.name }
    })
  }

  public async getUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id: id }
    })
  }

  public async create(userDto: UserDto) {
    let role = this.roleService.roleByName(userDto.role ?? 'user')
    this.log.debug(`before crypted password: ${userDto.password}`)
    userDto.password = md5(userDto.password)
    this.log.debug(`after crypted password: ${userDto.password}`)
    await this.userRepository.manager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.save(User, userDto)
      await transactionalEntityManager.save(UserRole, userDto.park && userDto.role === 'parkadmin' ? {
        role: role.id, user: user.id, plugin: userDto.park
      } : { 
        role: role.id, user: user.id 
      })
    })
  }

  public async createByRegister(userDto: UserDto, way: string) {
    if (way !== 'name') {
      userDto.name = `${way}-${userDto.phone ?? userDto.email}`
    }
    await this.create(userDto)
  }

  public async remove(id: string) {
    this.userRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softDelete(UserRole, { user: id })
      await transactionalEntityManager.softDelete(Car, { user: id })
      await transactionalEntityManager.softDelete(User, id)
    })
  }

  public async update(userDto: UserDto) {
    if (userDto.password) {
      userDto.password = md5(userDto.password)
    }
    delete userDto.role
    await this.userRepository.update(userDto.id, userDto)
  }

  public async auth(userDto: UserDto) {
    if (!userDto.password) {
      return null;
    }
    this.log.debug(`before crypted password: ${userDto.password}`)
    userDto.password = md5(userDto.password)
    const { name, password } = userDto
    this.log.debug(`after crypted password: ${userDto.password}`)
    let user = await this.userRepository.findOne({
      where: { name, password }
    })
    if (!user) {
      user = await this.userRepository.findOne({
        where: { phone: name, password } 
      })
    }
    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: name, password }
      }) 
    }
    if (!user || user.restricted === 1) {
      return null;
    }
    const { role, plugin } = await this.userRoleRepository.findOne({
      where: {user: user.id}
    })
    if (role == null) {
      return null;
    }
    let roleObj = await this.roleService.roleById(role)
    return {
      user: user,
      role: roleObj,
      plugin: roleObj.name === 'parkadmin' && plugin ? plugin: undefined
    }
  }

  public async setPassword(passwordUpdateDto: PasswordUpdateDto) {
    const user = await this.userRepository.findOne({
      where: { id: passwordUpdateDto.id, password: md5(passwordUpdateDto.password) }
    })
    // this.log.debug(`id: ${passwordUpdateDto.id}; old password crypted: ${md5(passwordUpdateDto.password)}; new password crypted: ${md5(passwordUpdateDto.newPassword)};`)
    if (!user) {
      return false;
    }
    user.password = md5(passwordUpdateDto.newPassword)
    await this.userRepository.update(user.id, user)
    return true;
  }

}