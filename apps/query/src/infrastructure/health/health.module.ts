import { Module } from '@nestjs/common';
import { AppHealthController } from './health.controller';

@Module({
  controllers: [AppHealthController],
})
export class AppHealthModule {}
