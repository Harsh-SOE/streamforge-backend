import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { AppHealthModule } from './infrastructure/health';
import { MeasureModule } from './infrastructure/measure';
import { GrpcModule } from './presentation/grpc/grpc.module';

@Module({
  imports: [AppConfigModule, GrpcModule, AppHealthModule, MeasureModule],
})
export class AppModule {}
