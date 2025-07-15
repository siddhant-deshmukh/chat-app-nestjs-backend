import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatType } from 'src/common/enums';

export type ChatDocument = Chat & Document;

@Schema({
  timestamps: true,
})
export class Chat {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(ChatType),
  })
  chat_type: ChatType;

  @Prop({
    type: String,
    maxlength: 100,
  })
  bio?: string;

  @Prop({
    type: String,
    match: [/^https?:\/\/.+/, 'Please use a valid URL for the avatar'],
  })
  avatarUrl?: string;

  @Prop({
    type: String,
  })
  name?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members?: Types.ObjectId[]; //* If chat_type == 'group chat this field should be null'

  @Prop({
    default: 2,
  })
  members_count: number

  @Prop({ type: String })
  last_msg?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  last_msg_author?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

