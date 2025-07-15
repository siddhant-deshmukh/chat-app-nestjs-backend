import { SetMetadata } from '@nestjs/common';
import { ChatMemberRole } from '../enums'; // Adjust path

export const CHAT_ROLES_KEY = 'chatRoles'; // Key to retrieve metadata in the guard
export const ChatRoles = (...roles: ChatMemberRole[]) => SetMetadata(CHAT_ROLES_KEY, roles);