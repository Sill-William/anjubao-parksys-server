import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { UserDto } from "src/entity/dto/user.dto";
import jwtConfig from "src/config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entity/user.entity";
import { ActiveUser } from "src/util/declare/active-user.declare";
import { Role } from "src/entity/role.entity";
import { PasswordUpdateDto } from "src/entity/dto/password-update.dto";

@Injectable() 
export class AuthService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, 
  ) {}

  async login(userDto: UserDto, reqRole: string) { 
    let authObj = await this.userService.auth(userDto)
    if (!authObj) {
      return null;
    }
    const { user, role, plugin } = authObj
    if (reqRole && role.name.indexOf(reqRole) === -1) {
      return null; 
    }
    if (user.restricted === 1) {
      return {
        user,
        token: null,
      }
    }
    return {
      ...(await this.generateTokens(user, role, plugin)),
      user, role
    }
  }

  async signup(userDto: UserDto, way: string) {
    return await this.userService.createByRegister(userDto, way)
  }

  async setPassword(passwordUpdateDto: PasswordUpdateDto) {
    return await this.userService.setPassword(passwordUpdateDto)
  }

  async generateTokens(user: User, role: Role, plugin?: string) {
    const token = await this.signToken<Partial<ActiveUser>>(user.id, {
      name: user.name,
      role: role.name,
      avatar: user.avatar,
      plugin: plugin
    })
    return { token }
  }

  async info(id: string) {
    return await this.userService.getUserById(id)
  }

  private async signToken<T>(userId: string, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl
      }
    )
  } 

  static pageAllowed(role: string, url: string) {
    const roleMap = {
      rootadmin: [
        // /^\/user\/admin.*/,
        /^\/user\/.*/,
        /^\/role.*/,
        /^\/background.*/,
        /^\/auth.*/,
        /^\/park\/all\/ids.*/,
        /^\/feedback.*/,
      ],
      parkadmin: [
        /^\/park.*/,
        /^\/order.*/,
        /^\/park-fee.*/,
        /^\/evaluate\/all.*/,
        /^\/background.*/,
        /^\/auth.*/,
        /^\/feedback.*/,
      ],
      useradmin: [
        /^\/user(?!\/admin).*/,
        /^\/car.*/,
        /^\/evaluate.*/,
        /^\/background.*/,
        /^\/auth.*/,
        /^\/feedback.*/,
      ],
      user: [
        /^\/park\/all.*/,
        /^\/car.*/,
        /^\/order\/(apply|update|all|latest).*/,
        /^\/payment.*/,
        /^\/auth\/(set-password|info).*/,
        /^\/feedback/,
        /^\/evaluate/,
        /^\/upload.*/,
        /^\/user/
      ],
    }
    return roleMap[role].some((reg: RegExp) => reg.test(url))
  }
}