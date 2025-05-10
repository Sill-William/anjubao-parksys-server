import { IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class CarQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  sign: string
  
  @IsString()
  @IsOptional()
  user: string
}