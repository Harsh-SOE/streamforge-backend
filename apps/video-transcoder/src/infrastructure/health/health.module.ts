import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { AppHealthService } from './health.service';
import { AppHealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [AppHealthController],
  providers: [AppHealthService],
})
export class AppHealthModule {}
