import { Module } from '@nestjs/common';

import { AppConfigModule } from '@videos/infrastructure/config';
import { MeasureModule } from '@videos/infrastructure/measure';
import { GrpcModule } from '@videos/presentation/grpc';

import { AppHealthModule } from './infrastructure/health';
import { MessageModule } from './presentation/message-broker';

@Module({
  imports: [GrpcModule, MessageModule, MeasureModule, AppConfigModule, AppHealthModule],
})
export class AppModule {}
