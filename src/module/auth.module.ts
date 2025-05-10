import { Module } from "@nestjs/common";
import { AuthController } from "src/controller/auth.controller";
import { AuthService } from "src/service/auth.service";
import { UserModule } from "./user.module";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "src/config/jwt.config";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "src/guard/access-token.guard";

@Module({
  imports: [UserModule, ConfigModule.forFeature(jwtConfig), JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [AuthController],
  providers: [AuthService, {
    provide: APP_GUARD,
    useClass: AccessTokenGuard
  }]
})
export class AuthModule {

}