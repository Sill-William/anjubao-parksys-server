import { IsDate, IsOptional, IsString } from "class-validator";

export class BaseDto {
  @IsString()
  @IsOptional()
  public id?: string;

  @IsDate()
  @IsOptional()
  public created?: Date;

  @IsDate()
  @IsOptional()
  public updated?: Date;

  @IsDate()
  @IsOptional()
  public deleted?: Date;
}