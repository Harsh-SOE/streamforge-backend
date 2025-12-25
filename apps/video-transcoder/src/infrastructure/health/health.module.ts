import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';

import { AppHealthController } from './health.controller';
import { AppHealthService } from './health.service';

import { TranscoderConfigModule } from '../config';

@Module({
  imports: [TerminusModule, TranscoderConfigModule],
  controllers: [AppHealthController],
  providers: [AppHealthService],
})
export class AppHealthModule {}
