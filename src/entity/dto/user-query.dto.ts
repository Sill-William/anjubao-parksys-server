import { IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class UserQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  role?: string
}