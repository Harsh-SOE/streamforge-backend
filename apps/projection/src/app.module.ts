import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config/config.module';
import { KafkaModule } from './presentation/kafka/kafka.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { MeasureModule } from './infrastructure/measure';

@Module({
  imports: [AppConfigModule, KafkaModule, AppHealthModule, MeasureModule],
})
export class AppModule {}
