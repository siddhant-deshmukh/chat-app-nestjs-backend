import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateMsgDto } from './dto/create-msg.dto';
import { MessageService } from './services/message.service';
import { Types } from 'mongoose';
import { ChatAuthGuard } from 'src/common/guard/chat-auth.guard';
import { ChatRoles } from 'src/common/decorators/chat-roles.decorator';
import { ChatMemberRole } from 'src/common/enums';

@Controller('msg')
export class MessageController {

  constructor(
    private msgService: MessageService
  ) { }

  @Post(':chat_id')
  @UseGuards(AuthGuard('jwt'), ChatAuthGuard)
  @ChatRoles(ChatMemberRole.Admin, ChatMemberRole.Member)
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request, @Param('chat_id') chatId: string, @Body() createMsgDto: CreateMsgDto) {
    if(!req.user?._id) throw new UnauthorizedException();
    if(!Types.ObjectId.isValid(chatId)) throw new BadRequestException('Invalid Chat Id.')

    return this.msgService.add(createMsgDto, req.user._id, chatId);
  }

  @Get(':chat_id')
  @UseGuards(AuthGuard('jwt'), ChatAuthGuard)
  @ChatRoles(ChatMemberRole.Admin, ChatMemberRole.Member, ChatMemberRole.Subscriber)
  getAll(@Req() req: Request, @Param('chat_id') chatId: string, @Query() query: { prev_msg_id: string, limit: string }) {
    if(!req.user?._id) throw new UnauthorizedException();
    if(!Types.ObjectId.isValid(chatId)) throw new BadRequestException('Invalid Chat Id.')

    let { limit, prev_msg_id } = query;  

    if(!limit) limit = '20';

    return this.msgService.getAll(chatId, limit, prev_msg_id);
  }
}
