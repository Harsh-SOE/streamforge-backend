import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config';
import { GrpcModule } from './presentation/gprc/gprc.module';
import { AppHealthModule } from './infrastructure/health';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [AppConfigModule, GrpcModule, AppHealthModule, MeasureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
