import { Body, Controller, Delete, Get, Inject, Logger, Post, Query, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { PasswordUpdateDto } from "src/entity/dto/password-update.dto";
import { UserDto } from "src/entity/dto/user.dto";
import { AuthService } from "src/service/auth.service";
import { Public } from "src/util/decorator/public.decorator";
import { OperationFactory } from "src/util/factory/operation.factory";

@Controller('/auth')
export class AuthController {

  private readonly log = new Logger(AuthController.name)
  
  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  @Get('/in')
  @Render('disorder/auth')
  @Public()
  async manager() {
    return {
      'type': 'in'
    }
  }

  @Post('/in')
  @Public()
  async login(@Body() userDto: UserDto, @Req() request: Request, @Res() res: Response) {
    if (!request.headers['x-role']) {
      return res.send({
        'status': 'failed',
        'message': '非法请求'
      })
    }
    this.log.debug(request.headers['x-role'])
    if (typeof request.headers['x-role'] !== 'string') {
      return res.send({
       'status': 'failed',
       'message': '非法请求'
      })
    }
    const loginRes = await this.authService.login(userDto, request.headers['x-role'])
    if (!loginRes) {
      return res.send({
        'status': 'failed',
        'message': '用户名或密码错误'
      })
    }
    if (!loginRes.token && loginRes.user.restricted === 1) {
      return res.send({
       'status': 'failed',
       'message': '用户已被封禁' 
      })
    }
    const { token } = loginRes
    this.log.debug(token)
    if (!token) {
      return res.send({
        'status': 'failed',
        'message': '用户名或密码错误'
      })
    }
    // write to header 
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })
    return res.send({
      'status': 'success',
      'message': '登录成功',
      'token': token
    })
  }

  @Post('/up')
  @Public()
  async signup(@Body() userDto: UserDto, @Query('way') way: string) {
    const waySet = new Set(['email', 'phone', 'name'])
    if (!way || !waySet.has(way)) {
      return {
       'status': 'failed',
       'message': '非法请求'
      }
    }
    // OperationFactory.doOperInCtr(async () => {
    //   await this.authService.signup(userDto, way.trim())
    // })
    try {
      await this.authService.signup(JSON.parse(JSON.stringify(userDto)), way.trim())
      let { token } = await this.authService.login(JSON.parse(JSON.stringify(userDto)), 'user')
      return {
        'status': 'success',
        'message': '注册成功',
        'token': token
      }
    } catch (error) {
      return {
        'status': 'failed',
        'message': `注册失败, ${error}`
      } 
    } 
  } 

  @Delete('/out')
  @Public()
  async logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('jwt')
    return res.send({
      'status': 'success',
      'message': '退出成功'
    })
  }

  @Get('/info')
  async fetchuser(@Req() req: Request) {
    this.log.debug(req['user'])
    const user = req['user']
    if (!user) {
      return {
        'status': 'failed',
        'message': '非法请求'
      }
    }
    const id = user.id || user.sub
    const info = await this.authService.info(id)
    return { 
      'status': req['user'] ? 'success' : 'failed',
      'data': {
        ...req['user'],
        ...info,
      }
    }
  }

  @Post('/set-password')
  async setPassword(@Body() passwordUpdateDto: PasswordUpdateDto, @Req() req: Request) {
    if (!req['user']) {
      return {
        'status': 'failed',
        'message': '非法请求'
      }
    }
    const user = req['user']
    passwordUpdateDto.id = user.id || user.sub
    try {
      const success = await this.authService.setPassword(passwordUpdateDto)
      return {
        'status': success ? 'success' : 'failed',
        'message': success ? '修改成功' : '原密码错误'
      }
    } catch (error) {
      return {
        'status': 'failed',
        'message': '服务器错误'
      }
    }
  }
}