import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config/config.module';
import { KafkaModule } from './presentation/kafka/kafka.module';
import { AppHealthModule } from './infrastructure/health/health.module';

@Module({
  imports: [AppConfigModule, KafkaModule, AppHealthModule],
})
export class AppModule {}
