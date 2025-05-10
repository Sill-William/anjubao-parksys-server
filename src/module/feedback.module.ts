import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedbackController } from "src/controller/feedback.controller";
import { Feedback } from "src/entity/feedback.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [],
})
export class FeedbackModule {}