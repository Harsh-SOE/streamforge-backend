import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { LOGGER_PORT } from '@app/ports/logger';

import { AppHealthModule } from './infrastructure/health/health.module';
import { AppConfigModule } from './infrastructure/config';
import { GrpcModule } from './presentation/grpc';
import { WinstonLoggerAdapter } from './infrastructure/logger';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [
    AppConfigModule,
    GrpcModule,
    AppHealthModule,
    ScheduleModule.forRoot(),
    MeasureModule,
  ],
  providers: [{ provide: LOGGER_PORT, useClass: WinstonLoggerAdapter }],
})
export class AppModule {}
