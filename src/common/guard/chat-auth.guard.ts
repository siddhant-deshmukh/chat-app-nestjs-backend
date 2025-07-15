import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';

import { ChatMemberRole } from '../enums';
import { CHAT_ROLES_KEY } from '../decorators/chat-roles.decorator';
import { ChatMember, ChatMemberDocument } from 'src/chat/schemas/chatmembers.schema';

@Injectable()
export class ChatAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(ChatMember.name) private chatMemberModel: Model<ChatMemberDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ChatMemberRole[]>(CHAT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { chat_id: chatId } = request.params;
    const userId = request.user?._id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated.');
    }
    if (!chatId || !Types.ObjectId.isValid(chatId)) {
      throw new BadRequestException('Invalid chat ID provided in URL.');
    }

    const chatMember = await this.chatMemberModel.findOne({
      chat_id: new Types.ObjectId(chatId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (!chatMember) {
      throw new ForbiddenException('Not a member of this chat or chat not found.');
    }

    request.chatMember = chatMember;
    if (!requiredRoles.includes(chatMember.role)) {
      throw new ForbiddenException('Access Denied: Insufficient role for this chat.');
    }

    return true;
  }
}