import { Controller, Get, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';


@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }
  
  @Get('')
  @UseGuards(AuthGuard('jwt')) 
  async getProfile(@Req() req: Request) {
    if(!req.user?._id) throw BadRequestException;

    const user = await this.usersService.findById(req.user._id);
    return user;
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user_id: string }) {
    const users = await this.usersService.findAll()
    return { users };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
