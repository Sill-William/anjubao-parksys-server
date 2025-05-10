import { IsOptional, IsString } from "class-validator"

export class PasswordUpdateDto {
  @IsString()
  @IsOptional()
  id: string 

  @IsString()
  password: string

  @IsString()
  newPassword: string
}