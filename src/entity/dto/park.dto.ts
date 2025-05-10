import { IsNumber, IsOptional, IsString } from "class-validator"
import { BaseDto } from "./base.dto"
import { Transform } from "class-transformer"
import { s2n } from "src/util/transformer/param.transform"

export class ParkDto extends BaseDto {

  @IsString()
  name: string

  @IsString()
  address: string

  @IsString()
  @IsOptional()
  description: string

  @IsString()
  responsible: string

  @IsString()
  phone: string

  @IsString()
  @IsOptional()
  email?: string

  @Transform(s2n)
  @IsNumber()
  lat: number

  @Transform(s2n)
  @IsNumber()
  lng: number

  @Transform(s2n)
  @IsNumber()
  capacity: number

  @Transform(s2n)
  @IsNumber()
  @IsOptional()
  rest: number

}