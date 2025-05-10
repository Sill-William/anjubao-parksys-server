import { IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";

export class FeedbackDto extends BaseDto {
  @IsString()
  content: string

  @IsString()
  @IsOptional()
  user: string
}