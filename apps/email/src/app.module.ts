import { Module } from '@nestjs/common';

import { KafkaService } from './presentation/kafka/kafka.service';
import { KafkaController } from './presentation/kafka/kafka.controller';
import { KakfaModule } from './presentation/kafka/kafka.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { MeasureModule } from './infrastructure/measure/measure.module';
import { AppHealthModule } from './infrastructure/health';

@Module({
  imports: [KakfaModule, AppConfigModule, MeasureModule, AppHealthModule],
  providers: [KafkaService],
  controllers: [KafkaController],
})
export class AppModule {}
