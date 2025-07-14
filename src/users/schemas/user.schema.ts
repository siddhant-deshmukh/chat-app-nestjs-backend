import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface IUser {
  name: string;
  user_name: string;
  avatarUrl?: string;
  password?: string;
  bio?: string;
}

@Schema()
export class User {
  @Prop({
    required: true,
    minlength: 5,
    maxlength: 30,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
    lowercase: true,
  })
  user_name: string;

  @Prop({
  })
  avatarUrl: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    maxlength: 100,
  })
  bio: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;