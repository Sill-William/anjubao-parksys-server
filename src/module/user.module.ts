import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { RoleModule } from "./role.module";
import { UserController } from "src/controller/user.controller";
import { UserService } from "src/service/user.service";
import { UserRole } from "src/entity/user-role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole]), RoleModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}