import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppConfigModule } from './infrastructure/config';
import { AppHealthModule } from './infrastructure/health';

import { GrpcModule } from './presentation/grpc';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [
    AppConfigModule,
    GrpcModule,
    AppHealthModule,
    ScheduleModule.forRoot(),
    MeasureModule,
  ],
})
export class AppModule {}
