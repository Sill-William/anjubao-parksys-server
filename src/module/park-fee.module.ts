import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkFeeController } from "src/controller/park-fee.controller";
import { ParkFee } from "src/entity/park-fee.entity";
import { ParkFeeService } from "src/service/park-fee.service";

@Module({
  imports: [TypeOrmModule.forFeature([ParkFee])],
  providers: [ParkFeeService],
  controllers: [ParkFeeController],
  exports: [ParkFeeService],
})
export class ParkFeeModule {}