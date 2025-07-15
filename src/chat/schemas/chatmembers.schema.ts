import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatMemberRole } from 'src/common/enums';

export type ChatMemberDocument = ChatMember & Document;

@Schema({
  timestamps: true,
})
export class ChatMember {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(ChatMemberRole),
  })
  role: ChatMemberRole;

  @Prop({ type: Types.ObjectId, ref: 'Chat' })
  chat_id: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    default: Date.now()
  })
  last_seen: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ChatMemberSchema = SchemaFactory.createForClass(ChatMember);

ChatMemberSchema.index({ chat_id: 1, user_id: 1 }, { unique: true });