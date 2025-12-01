import { Module } from '@nestjs/common';

import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  providers: [KafkaService],
  controllers: [KafkaController],
})
export class KafkaModule {}
