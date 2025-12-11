import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { AppHealthModule } from './infrastructure/health';
import { GrpcModule } from './presentation/grpc/grpc.module';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [AppConfigModule, GrpcModule, AppHealthModule, MeasureModule],
})
export class AppModule {}
