import { Module } from "@nestjs/common";
import { PaymentController } from "src/controller/payment.controller";

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [],
  exports: []
})
export class PaymentModule {}