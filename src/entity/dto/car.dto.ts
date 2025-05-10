import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";

export class CarDto extends BaseDto {
  @IsString()
  sign: string

  @IsString()
  @IsOptional()
  user: string

  @IsNumber()
  @IsOptional()
  restricted: number  
}