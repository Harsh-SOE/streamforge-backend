import { Module } from '@nestjs/common';
import { AppConfigModule } from './infrastructure/config';
import { AppHealthModule } from './infrastructure/health';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [AppConfigModule, AppHealthModule, MeasureModule],
})
export class AppModule {}
