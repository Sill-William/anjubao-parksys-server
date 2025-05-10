import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class EvaluateQueryDto extends BaseQueryDto {

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  park?: string

  @IsString()
  @IsOptional()
  order?: string

  @IsNumber()
  @IsOptional()
  score?: number

}