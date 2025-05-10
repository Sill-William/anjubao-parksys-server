import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleController } from "src/controller/role.controller";
import { Role } from "src/entity/role.entity";
import { UserRole } from "src/entity/user-role.entity";
import { RoleService } from "src/service/role.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole])
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {
  
}