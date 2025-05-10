import { ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import jwtConfig from "src/config/jwt.config";
import { AuthService } from "src/service/auth.service";
import { REQUEST_USER_KEY } from "src/util/constant/base.constant";
import { IS_PUBLIC_KEY } from "src/util/decorator/public.decorator";

@Injectable()
export class AccessTokenGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig> 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler())
    if (isPublic) {
      return true
    }
    const request: Request = context.switchToHttp().getRequest()
    const response: Response = context.switchToHttp().getResponse()
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      // response.redirect('/auth/in')
      this.refuse(request, response, 1)
      return false
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, this.jwtConfiguration)
      if (!AuthService.pageAllowed(payload.role, request.url)) {
        // response.redirect('/background/404')
        this.refuse(request, response, 2)
        return false
      }
      request[REQUEST_USER_KEY] = payload
    } catch (error) {
      // throw new UnauthorizedException()
      return context.switchToHttp().getResponse().redirect('/auth/in')
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    let token = request.cookies['jwt']?.split(' ') ?? []
    if (!token) { // token is not founded in cookie, try to find it in header
      token = request.headers.authorization?.split(' ') ?? []
    }
    return token && token.length >= 1 ? token[0] : null
  }

  /**
   * 
   * @param req 请求体
   * @param res 响应体
   * @param cause 1: 未登录 2: 权限不足
   */
  private refuse(req: Request, res: Response, cause: 1 | 2) {
    const xFromApp = !!req.headers['x-from-app']
    console.debug('we check xFromApp now, the result is', xFromApp)
    switch (cause) {
      case 1:
        xFromApp ? res.send({
          auth_refuse: true,
          cause: '未登录'
        }) : res.redirect('/auth/in')
        break
      case 2:
        xFromApp? res.send({
          auth_refuse: true,
          cause: '权限不足'
        }) : res.redirect('/background/404')
        break
      default: 
        break
    }
  }
}