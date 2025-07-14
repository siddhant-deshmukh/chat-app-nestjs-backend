// src/user/dto/create-user.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  user_name: string;

  @IsOptional()
  @IsString()
  @IsUrl() // Use IsUrl for URL validation
  avatarUrl?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8) // Example password length
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string;
}