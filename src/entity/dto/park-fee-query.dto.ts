import { IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class ParkFeeQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  park: string
}