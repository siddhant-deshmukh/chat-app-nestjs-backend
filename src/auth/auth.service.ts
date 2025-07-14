// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { CustomConfigService } from '../config/custom-config.service';
import { UsersService } from '../users/users.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly configService: CustomConfigService,
  ) {}

  async register(authRegisterDto: AuthRegisterDto): Promise<{ user: Partial<User>; token: string }> {
    const { name, user_name, password, avatarUrl, bio } = authRegisterDto;

    const existingUser = await this.userService.findByUsername(user_name);
    if (existingUser) {
      throw new ConflictException('User with this username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.userService.create({
      name,
      user_name,
      password: hashedPassword,
      avatarUrl,
      bio,
    });

    const token = this._getJwtToken(newUser._id.toString());

    this.logger.log(`User registered successfully: ${newUser.user_name}`);

    const { password: _, ...result } = newUser.toObject();
    return { user: result, token };
  }

  async login(authLoginDto: AuthLoginDto): Promise<{ user: Partial<User>; token: string }> {
    const { user_name, password } = authLoginDto;

    // Find user by user_name
    const user = await this.userService.findByUsername(user_name, true);

    // Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`Login failed: Invalid credentials for user_name "${user_name}"`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this._getJwtToken(user._id.toString());

    this.logger.log(`User logged in successfully: ${user.user_name}`);

    // Return user data (excluding password) and token
    const { password: _, ...result } = user;
    return { user: result, token };
  }

  private _getJwtToken(userId: string): string {
    const jwtSecret = this.configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured'); // Should be caught by validationSchema
    }
    return jwt.sign({ _id: userId }, jwtSecret, { expiresIn: '30d' });
  }
}