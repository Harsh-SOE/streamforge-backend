import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { AppHealthModule } from './infrastructure/health';
import { GrpcModule } from './presentation/grpc';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [AppConfigModule, AppHealthModule, GrpcModule, MeasureModule],
})
export class AppModule {}
