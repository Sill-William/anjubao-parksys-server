import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EvaluateController } from "src/controller/evaluate.controller";
import { Evaluate } from "src/entity/evaluate.entity";
import { EvaluateService } from "src/service/evaluate.service";
import { OrderModule } from "./order.module";

@Module({
  imports: [TypeOrmModule.forFeature([Evaluate]), OrderModule],
  controllers: [EvaluateController],
  providers: [EvaluateService]
})
export class EvaluateModule {}