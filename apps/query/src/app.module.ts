import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { MeasureModule } from './infrastructure/measure';
import { GrpcModule } from './presentation/grpc/grpc.module';

@Module({
  imports: [AppConfigModule, GrpcModule, MeasureModule],
})
export class AppModule {}
