import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CustomConfigService } from './config/custom-config.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: CustomConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.configService.get('MONGO_URL') || '';
  }
}
