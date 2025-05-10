import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";
import { s2n } from "src/util/transformer/param.transform";

export class ParkImageQueryDto {
  @Transform(s2n)
  @IsNumber()
  lng: number

  @Transform(s2n)
  @IsNumber()
  lat: number
}