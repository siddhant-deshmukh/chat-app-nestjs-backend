// src/message/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageType } from 'src/common/enums';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chat_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.Text,
  })
  type: MessageType;

  @Prop({
    type: String,
    maxlength: 500,
  })
  text?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.post<MessageDocument>('save', async function(doc) {
  const ChatModel = this.model('Chat');
  try {
    await ChatModel.findByIdAndUpdate(
      doc.chat_id,
      {
        $set: {
          last_msg: doc.text,
          last_msg_author: doc.author_id,
        },
      },
      { new: true },
    );
  } catch (error) {
    console.error(`Error updating chat after message save: ${error}`);
  }
});