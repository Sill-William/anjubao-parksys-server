import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkController } from "src/controller/park.controller";
import { Park } from "src/entity/park.entity";
import { ParkService } from "src/service/park.service";

@Module({
  imports: [TypeOrmModule.forFeature([Park])],
  controllers: [ParkController],
  providers: [ParkService],
  exports: [ParkService]
})
export class ParkModule {}