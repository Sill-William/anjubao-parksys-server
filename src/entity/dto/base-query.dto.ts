import { Transform } from "class-transformer"
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"
import { s2n } from "src/util/transformer/param.transform"

export class BaseQueryDto {
  @Transform(s2n)
  @IsNumber()
  page: number = 1
  @Transform(s2n)
  @IsNumber()
  limit: number = 10
  @IsString()
  @IsOptional()
  id?: string
  @IsBoolean()
  @IsOptional()
  sort?: boolean
}