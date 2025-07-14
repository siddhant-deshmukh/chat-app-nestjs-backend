import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, BadRequestException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { User } from '../users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { AuthRegisterDto } from './dto/auth-register.dto';



@Controller('')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Explicitly set 201 Created
  async register(@Body() authRegisterDto: AuthRegisterDto) {
    return this.authService.register(authRegisterDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set 200 OK
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.login(authLoginDto);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt')) 
  async getProfile(@Req() req: Request) {
    if(!req.user?._id) throw BadRequestException;

    const user = await this.userService.findById(req.user._id);
    return user;
  }
}