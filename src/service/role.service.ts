import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleDto } from "src/entity/dto/role.dto";
import { Role } from "src/entity/role.entity";
import { UserRole } from "src/entity/user-role.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class RoleService {
  private readonly log = new Logger(RoleService.name)

  // private static ROLE_SET = new Set<string>()
  private static ROLE_MAP = new Map<string, Role>()

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole) private readonly userroleRepository: Repository<UserRole>
  ) {
    this.roleRepository.find().then(roles => {
      // roles.forEach(r => RoleService.ROLE_SET.add(r.name))
      roles.forEach(r => RoleService.ROLE_MAP.set(r.name, r))
      this.log.log('now role set loaded')
    })
  }

  async allRole() {
    return Array.from(RoleService.ROLE_MAP.values())
  }

  roleByName(name: string) {
    // return await this.roleRepository.findAndCount({ where: { name } }) 
    if (!RoleService.ROLE_MAP.has(name)) {
      return null
    }
    return RoleService.ROLE_MAP.get(name)
  }

  async userIdsByRoleName(name: string) {
    const role = this.roleByName(name)
    if (!role) {
      return []
    }
    const userRoles = await this.userroleRepository.findAndCount({
      where: {
        role: role.id
      }
    })
    if (userRoles[1] === 0) {
      return []
    }
    return userRoles[0].map(ur => ur.user)
  }

  // 根据用户 id 找其角色
  async roleOf(u: string) {
    const rs = await this.userroleRepository.findAndCount({ where: { user: u } })
    if (rs[1] === 0) {
      return []
    } 
    return await this.roleRepository.findAndCount({
      where: {
        id: In(rs[0].map(ur => ur.role))
      }
    })
  }

  // 根据角色 id 找其用户
  async userOf(r: string) {
    const rs = await this.userroleRepository.findAndCount({ where: { role: r } })
    if (rs[1] === 0) {
      return [] 
    }
    return rs[0].map(ur => ur.user)
  }

  async addRole(name: string, description?: string) {
    return await this.roleRepository.insert({ name, description })
  }  

  async addRoleFor(u: string, r: string) {
    const ur = await this.userroleRepository.find({
      where: {
        user: u,
        role: r
      }
    })
    if (ur.length !== 0) {
      return null;
    }
    return await this.userroleRepository.insert({ user: u, role: r })
  }

  async delRole(id: string) {
    return await this.roleRepository.softDelete(id)
  }

  async delRoleForUser(u: string, r: string) {
    const ur = await this.userroleRepository.find({
      where: {
        user: u,
        role: r
      }
    })
    if (ur.length === 0) {
      return null;
    }
    const urf = ur[0]
    return await this.userroleRepository.softDelete(urf.id)
  }

  async create(roleDto: RoleDto) {
    const role = await this.roleRepository.save(roleDto)
    RoleService.ROLE_MAP.set(roleDto.name, role)
  }

  async roleById(r: string) {
    return Array.from(RoleService.ROLE_MAP.values()).filter(rd => rd.id === r)[0]
  }
}