import { IsEnum, IsOptional, IsString, MaxLength, IsUrl, IsNotEmpty, IsMongoId } from 'class-validator';
import { ChatType } from 'src/common/enums';

export class CreateChatDto {
  @IsEnum(ChatType, { message: 'Invalid chat type' })
  chat_type: ChatType;

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
  @IsNotEmpty({ message: 'Name cannot be empty for group chats' })
  name?: string;

  @IsMongoId({ each: true, message: 'Each member ID must be a valid Mongo ObjectId' })
  members: string[];
}