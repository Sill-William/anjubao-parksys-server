import { IsDate, IsString } from "class-validator";
import { BaseDto } from "./base.dto";
import { Transform } from "class-transformer";
import { s2d } from "src/util/transformer/param.transform";

export class ParkFeeDto extends BaseDto {
  @IsString()
  park: string

  @IsString()
  fee: number

  @Transform(s2d)
  @IsDate()
  start: Date

  @Transform(s2d)
  @IsDate()
  end: Date
}