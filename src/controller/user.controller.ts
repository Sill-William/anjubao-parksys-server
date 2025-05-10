import { Body, Controller, Delete, Get, Inject, Logger, Param, Patch, Post, Put, Query, Render, Req, Res } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Request, Response } from "express"
import { In, Repository } from "typeorm"
import { RoleService } from "src/service/role.service"
import { UserService } from "src/service/user.service"
import { UserQueryDto } from "src/entity/dto/user-query.dto"
import { UserDto } from "src/entity/dto/user.dto"
import { OperationFactory } from "src/util/factory/operation.factory"

@Controller('/user')
export class UserController {
  private readonly log = new Logger(UserController.name) 
  constructor(
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  @Get('/')
  @Render('module/user')
  async manager() {
    return {}
  }

  @Get('/admin/')
  @Render('module/user-admin')
  async adminManager() {
    return {}
  }

  @Get('/all')
  async all(@Query() query: UserQueryDto) {
    return {
      code: 0,
      data: await this.userService.getUsers(query)
    }
  }

  @Post('/')
  async create(@Body() body: UserDto) {
    try {
      await this.userService.create(body)
      return { attached: true }
    } catch (_) {
      return { attached: false }
    }
  }

  @Put('/')
  async update(@Body() body: UserDto, @Req() req: Request) {
    if (!body.id) {
      if (!req['user']) {
        return { attached: false }
      }
      const user = req['user']
      body.id = user.id || user.sub
    }
    return await OperationFactory.doOperInCtr(async () => {
      this.log.debug(body)
      await this.userService.update(body)
    })
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id)
  }

  @Patch('/release/:id')
  async release(@Param('id') id: string) {
    const ud = new UserDto(id, 0)
    try {
      await this.userService.update(ud)
      return { attached: true }
    } catch (_) {
      return { attached: false }
    }
  }

  // TODO: lock user is unavailable
  @Patch('/lock/:id')
  async lock(@Param('id') id: string) {
    const ud = new UserDto(id, 1)
    try {
      await this.userService.update(ud)
      return { attached: true }
    } catch (e) {
      this.log.debug(e)
      return { attached: false }
    }
  }

  @Put('/release/:id')
  async releaseById(@Param('id') id: string) {
    const ud = new UserDto(id, 0)
    try {
      await this.userService.update(ud)
      return { attached: true }
    } catch (e) {
      this.log.debug(e)
      return { attached: false }
    }
  }

  @Put('/lock/:id')
  async lockById(@Param('id') id: string) {
    const ud = new UserDto(id, 1)
    try {
      await this.userService.update(ud)
      return { attached: true }
    } catch (e) {
      this.log.debug(e)
      return { attached: false }
    }
  }

}