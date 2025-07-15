import { IsEnum, IsOptional, IsString, MaxLength, IsUrl, IsNotEmpty, IsMongoId } from 'class-validator';
import { MessageType } from 'src/common/enums';

export class CreateMsgDto {
  @IsEnum(MessageType, { message: 'Invalid chat type' })
  type: MessageType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  text?: string;

  // @IsMongoId({ message: 'Each member ID must be a valid Mongo ObjectId' })
  // chat_id: string;

  // @IsMongoId({ message: 'Each member ID must be a valid Mongo ObjectId' })
  // user_id: string;
}