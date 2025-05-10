import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarController } from "src/controller/car.controller";
import { Car } from "src/entity/car.entity";
import { CarService } from "src/service/car.service";
import { UserModule } from "./user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Car]), UserModule],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService]
})
export class CarModule {
  
}