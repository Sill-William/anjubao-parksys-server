import { IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseDto } from "./base.dto";
import { Transform } from "class-transformer";
import { s2d } from "src/util/transformer/param.transform";

export class UserDto extends BaseDto {
  @IsString()
  public name: string

  @IsEmail()
  @IsString()
  @IsOptional()
  public email?: string

  @IsString()
  @IsOptional()
  public phone?: string
  
  @IsString()
  @IsOptional()
  public password?: string

  @IsString()
  @IsOptional()
  public avatar?: string

  @IsNumber()
  @IsOptional()
  public gender?: number

  @Transform(s2d)
  @IsDate()
  @IsOptional()
  public birthday?: Date

  @IsString()
  @IsOptional()
  public role?: string = 'user'

  @IsNumber()
  @IsOptional()
  public restricted: number = 0

  @IsString()
  @IsOptional()
  public park?: string

  constructor(id?: string, restricted?: number) {
    super()
    this.id = id
    if (restricted) {
      this.restricted = restricted
    }
  }
}