import { IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";

export class RoleDto extends BaseDto {
  @IsString()
  public name: string

  @IsString()
  @IsOptional()
  public description?: string
}