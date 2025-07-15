import { ChatMemberDocument } from "src/chat/schemas/chatmembers.schema";

declare module 'express' {
  interface Request {
    user?: {
      _id: string
    }; // Or JwtPayload if you only attach payload
    chatMember?: ChatMemberDocument
  }
}