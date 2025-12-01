import { Module } from '@nestjs/common';
import { AppConfigModule } from './infrastructure/config/config.module';
import { KafkaModule } from './presentation/kafka/kafka.module';

@Module({
  imports: [AppConfigModule, KafkaModule],
})
export class AppModule {}
