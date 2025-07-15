import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessageService } from './services/message.service';
import { MessageController } from './message.controller';
import { ChatMember, ChatMemberSchema } from './schemas/chatmembers.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ChatAuthGuard } from 'src/common/guard/chat-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatMember.name, schema: ChatMemberSchema },
    ]),
  ],
  controllers: [ChatController, MessageController],
  providers: [ChatService, MessageService, ChatAuthGuard],
})
export class ChatModule {}
