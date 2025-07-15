export enum ChatType {
  Group = 'group_chat',
  User = 'user_chat',
}

export enum MessageType {
  Text = 'text',
  Image = 'img',
  Video = 'video',
  Document = 'doc',
}

export enum ChatMemberRole {
  Admin = 'admin',
  Member = 'member',
  Subscriber = 'subscriber'
  // null means regular member, handled by not setting the 'role' field
}