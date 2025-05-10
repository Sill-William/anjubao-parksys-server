import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";
import { Transform } from "class-transformer";
import { s2d, s2n } from "src/util/transformer/param.transform";

export class OrderDto extends BaseDto {
  
  @IsString()
  park: string

  @IsString()
  car: string

  @IsString()
  @IsOptional()
  user: string

  @IsNumber()
  status: 0 | 1 | 2 | 3 | 4 | 5

  @Transform(s2n)
  @IsNumber()
  bookingCost: number

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  bookedStart?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  applyEnterAt?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  bookedAt?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  inAt?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  outAt?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  paiedAt?: Date

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  endAt?: Date

  @IsString()
  @IsOptional()
  evaluate?: string
}