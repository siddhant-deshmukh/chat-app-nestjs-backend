import { PartialType } from '@nestjs/mapped-types'; 
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Bio cannot exceed 100 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Please use a valid URL for the avatar' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  name?: string;
}