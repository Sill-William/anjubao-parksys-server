import { Controller, Get, Logger, Render, Req } from "@nestjs/common";
import { Request } from "express";
import { REQUEST_USER_KEY } from "src/util/constant/base.constant";
import { Public } from "src/util/decorator/public.decorator";

@Controller('/background')
export class AppController {

  private readonly log = new Logger(AppController.name)

  @Get('/tg')
  @Render('inner')
  async inner(@Req() req: Request) {
    const user = req[REQUEST_USER_KEY]
    return {
      character: user.role,
      user: {
        name: user.name,
        avator: !user.avator || user.avator === '' ? '//unpkg.com/outeres@0.0.10/img/layui/icon-v2.png' : user.avator,
        plugin: user.plugin
      }
    }
  }

  @Get('/404')
  @Render('disorder/404')
  @Public()
  async notFound() {
    return {
      charactor: 'dev'
    }
  }
}