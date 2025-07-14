import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CustomConfigService } from 'src/config/custom-config.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule, 
  ],
  providers: [
    AuthService,
    JwtStrategy,
    CustomConfigService
  ],
  controllers: [AuthController]
})
export class AuthModule { }
