import { IsOptional, IsString } from "class-validator"
import { BaseQueryDto } from "./base-query.dto"

export class ParkQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  address?: string
}