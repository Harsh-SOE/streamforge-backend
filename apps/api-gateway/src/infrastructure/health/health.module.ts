import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { AppHealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [AppHealthController],
})
export class AppHealthModule {}
