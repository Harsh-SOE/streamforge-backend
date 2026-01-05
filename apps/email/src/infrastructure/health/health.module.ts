import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';

import { AppHealthService } from './health.service';
import { AppHealthController } from './health.controller';

import { EmailConfigModule } from '../config';

@Module({
  imports: [TerminusModule, EmailConfigModule],
  controllers: [AppHealthController],
  providers: [AppHealthService],
})
export class AppHealthModule {}
