import { Module } from '@nestjs/common';

import { BullMQTranscoderModule } from '@transcoder/infrastructure/queue/bullmq';
import { KafkaConsumerModule } from '@transcoder/infrastructure/events-consumer/kafka';

import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [KafkaConsumerModule, BullMQTranscoderModule],
  providers: [EventsListenerService],
})
export class EventListenerModule {}
