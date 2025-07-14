import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EnvVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  MONGO_URL: string;
  PORT: number;
  API_KEY?: string;
  JWT_SECRET: string;
  // Add all your environment variables here
}

@Injectable()
export class CustomConfigService extends ConfigService<EnvVariables>{}
