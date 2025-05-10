import { IsOptional, IsString } from "class-validator";

export class ParkAssociateDto {
  @IsString()
  @IsOptional()
  keyword: string
}