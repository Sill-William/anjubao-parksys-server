import { IsNumber, IsString } from "class-validator";
import { BaseDto } from "./base.dto";
import { Transform } from "class-transformer";
import { s2n } from "src/util/transformer/param.transform";

export class OrderUpdateDto extends BaseDto {
  
  @Transform(s2n)
  @IsNumber()
  status: 0 | 1 | 2 | 3 | 4 | 5

}