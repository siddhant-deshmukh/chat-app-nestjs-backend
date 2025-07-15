import { Injectable, BadRequestException, ConflictException, Req, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { ChatMemberRole, ChatType } from 'src/common/enums';
import { ChatMember, ChatMemberDocument } from '../schemas/chatmembers.schema';
import { ObjectId } from 'mongodb';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Message } from '../schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ChatMember.name) private chatMemberModel: Model<ChatMemberDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(createChatDto: CreateChatDto, user_id: string) {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let { chat_type, name, avatarUrl, bio, members } = createChatDto;

      if (chat_type === ChatType.Group && (!name || !name.trim())) {
        throw new BadRequestException('With Group Chat Name is mandetory');
      }
      if (chat_type === ChatType.User) {
        name = undefined;
        bio = undefined;
        avatarUrl = undefined;
      }

      if (chat_type === ChatType.User) {
        const existing = await this.chatModel.findOne({
          chat_type: ChatType.User,
          members: {
            $size: 2,
            $all: members.map(ele => new ObjectId(ele)),
          },
        }).session(session);
        if (existing) throw new ConflictException('Chat already exist with user');
      }
      if (members && !(user_id in members)) {
        members.push(user_id);
      }

      const createdChats = await this.chatModel.create([{
        chat_type, name, avatarUrl, bio,
        members_count: members.length,
        members: (chat_type === ChatType.Group) ? undefined : members,
      }], { session });

      const createdChat = createdChats[0];

      const chatMembersToCreate = members.map((member_id) => {
        let role: ChatMemberRole = ChatMemberRole.Member;
        if (member_id == user_id) role = ChatMemberRole.Admin;

        return {
          user_id: new ObjectId(member_id),
          chat_id: createdChat._id,
          role,
        };
      })
      await this.chatMemberModel.insertMany(chatMembersToCreate, { session });

      await session.commitTransaction();
      return { chat: createdChat.toJSON() };
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof ConflictException) {
        throw err
      }
      if (err instanceof BadRequestException) {
        throw err
      }
      throw new InternalServerErrorException('Failed to create chat due to an unexpected error.');
    } finally {
      session.endSession();
    }
  }

  async findAll(user_id: string): Promise<{ chats: ChatDocument[] }> {
    const chats = await this.chatMemberModel.aggregate([
      //* Getting all the Chats user is part of
      { $match: { user_id: new ObjectId(user_id) } },
      //* Getting data of these chats
      {
        $lookup: {
          from: this.chatModel.collection.name,
          localField: 'chat_id',
          foreignField: '_id',
          as: 'chatDetails',
        },
      },
      {
        $unwind: {
          path: '$chatDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { 'chatDetails.updatedAt': -1 } },
      //* If Chat -> Chat Type ( Then their are only two members of the chat ), 
      //* otherMemberId -> ID of that other member
      {
        $addFields: {
          otherMemberId: {
            $cond: {
              if: { $eq: ['$chatDetails.chat_type', 'user_chat'] },
              then: {
                $toObjectId: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$chatDetails.members',
                        as: 'member',
                        cond: { $ne: ['$$member', user_id] },
                      },
                    },
                    0, // Take the first (and only) element from the filtered array
                  ],
                }
              },
              else: null, // If not a 'user_chat', no 'otherMemberId'
            },
          },
        },
      },
      {
        $lookup: {
          from: this.userModel.collection.name,
          localField: 'otherMemberId',
          foreignField: '_id',
          as: 'otherUserDetails',
        },
      },
      {
        $unwind: {
          path: '$otherUserDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: this.userModel.collection.name,
          localField: 'chatDetails.last_msg_author',
          foreignField: '_id',
          as: 'lastMsgAuthorDetails',
        },
      },
      {
        $unwind: {
          path: '$lastMsgAuthorDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      //* No. of Unread messages
      {
        $lookup: {
          from: Message.name,
          let: {
            currentChatId: '$chatDetails._id',
            userLastSeen: '$last_seen', // 'last_seen' comes from the original ChatMember document
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chat_id', '$$currentChatId'] },
                    { $gt: ['$createdAt', '$$userLastSeen'] },
                  ],
                },
              },
            },
            {
              $limit: 101,
            },
            {
              $count: 'unReadCount', // Count the matched messages
            },
          ],
          as: 'unreadMessagesCount', // Output array, e.g., [{ unReadCount: 5 }] or []
        },
      },
      {
        $unwind: {
          path: '$unreadMessagesCount',
          preserveNullAndEmptyArrays: true,
        },
      },
      //* Changing the view of the final Object / Document / Chat
      {
        $addFields: {
          'chatDetails.name': {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$chatDetails.chat_type', 'user_chat'] },
                  { $ne: ['$otherUserDetails', null] }, // Check if other user details were found
                ],
              },
              then: '$otherUserDetails.name',
              else: '$chatDetails.name', // Default to the chat's own name (e.g., for group chats)
            },
          },
          'chatDetails.avatarUrl': {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$chatDetails.chat_type', 'user_chat'] },
                  { $ne: ['$otherUserDetails', null] },
                ],
              },
              then: '$otherUserDetails.avatarUrl',
              else: '$chatDetails.avatarUrl', // Default to the chat's own avatar URL
            },
          },
          'chatDetails.lastMsgUserDetails': '$lastMsgAuthorDetails',
          'chatDetails.unread_msg_count': '$unreadMessagesCount.unReadCount',
        },
      },
      { $replaceRoot: { newRoot: '$chatDetails' } },
    ]) as ChatDocument[];

    return { chats };
  }

  async findOne(id: string): Promise<ChatDocument | null> {
    return this.chatModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, updateChatDto: UpdateChatDto): Promise<ChatDocument | null> {
    // Note: The pre-save hook will still apply when .save() is called,
    // but updateOne/findByIdAndUpdate might bypass it depending on how they're used.
    // For full hook application, fetch document, modify, then save.
    const chat = await this.findOne(id);
    if (!chat) return null;

    Object.assign(chat, updateChatDto);
    return chat.save(); // This will trigger the pre-save hook
  }

  async remove(id: string): Promise<any> {
    return this.chatModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }
}