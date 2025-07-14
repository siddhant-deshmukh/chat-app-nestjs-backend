import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.find().select('-password').sort({ _id: -1 }).lean();
  }

  findById(user_id: string) {
    return this.userModel.findById(user_id).select('-password').lean();
  }

  findByUsername(username: string, with_password: boolean = false) {
    if(with_password) return this.userModel.findOne({ user_name: username }).lean();
    return this.userModel.findOne({ user_name: username }).select('-password').lean();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
