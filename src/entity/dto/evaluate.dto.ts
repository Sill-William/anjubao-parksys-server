import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";
import { Transform } from "class-transformer";
import { s2n } from "src/util/transformer/param.transform";

export class EvaluateDto extends BaseDto {
  @IsString()
  order: string 

  @IsString()
  @IsOptional()
  user: string

  @Transform(s2n)
  @IsNumber()
  score: number

  @IsString()
  comment: string
}