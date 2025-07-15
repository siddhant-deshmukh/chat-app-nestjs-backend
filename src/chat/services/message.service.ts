import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { CreateMsgDto } from '../dto/create-msg.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async add(createMsgDto: CreateMsgDto, user_id: string, chat_id: string) {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { text, type } = createMsgDto;

      const authorObjectId = new Types.ObjectId(user_id);
      const chatObjectId = new Types.ObjectId(chat_id);

      const [msg] = await this.messageModel.create([{
        author_id: authorObjectId,
        chat_id: chatObjectId,
        text,
        type,
      }], { session });

      const updatedChat = await this.chatModel.findOneAndUpdate(
        { _id: new Types.ObjectId(chat_id) },
        {
          last_msg: text,
          last_msg_author: user_id,
        })
      if (!updatedChat) {
        throw new NotFoundException('Chat not found or already deleted.');
      }

      await session.commitTransaction();

      return { message: msg, updatedChat: updatedChat.toJSON() };
    } catch (error) {
      await session.abortTransaction();
      console.error('Transaction failed and aborted:', error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add message and update chat.');
    } finally {
      session.endSession();
    }
  }

  async getAll(chat_id: string, limit: string, prev_msg_id?: string) {
    const msgs = await this.messageModel.aggregate([
      { $match: { chat_id: { $eq: new Types.ObjectId(chat_id) } } },
      ...(prev_msg_id ? [{ $match: { _id: { $lt: new Types.ObjectId(prev_msg_id) } } }] : []),
      { $sort: { createdAt: -1, _id: -1 } },
      { $limit: limit ? parseInt(limit) : 25 },
      {
        $lookup: {
          from: this.userModel.collection.name,
          foreignField: '_id',
          localField: 'author_id',
          as: 'msgAuthor',
          pipeline: [
            { $project: { name: 1, user_name: 1 } },
          ],
        },
      },
      {
        $unwind: {
          path: '$msgAuthor',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1, _id: 1 } },
    ]);

    return { msgs };
  }

}
