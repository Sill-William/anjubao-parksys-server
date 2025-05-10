import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class OrderQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  park?: string

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  car?: string

  @IsNumber()
  @IsOptional()
  status?: 0 | 1 | 2 | 3 | 4 | 5

  @IsDate()
  @IsOptional()
  bookedStart?: Date

  @IsDate()
  @IsOptional()
  bookedEnd?: Date
}