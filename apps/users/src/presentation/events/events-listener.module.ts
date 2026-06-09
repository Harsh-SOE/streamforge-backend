import { Module } from '@nestjs/common';

import { UserIntegrationEventHandlers } from '@users/application/events';
import { KafkaConsumerModule } from '@users/infrastructure/events-consumer/kafka';

import { EventsListenerService } from './events-listener.service';
import { EventsListenerController } from './events-listener.controller';

@Module({
  imports: [KafkaConsumerModule],
  providers: [EventsListenerService, EventsListenerController, ...UserIntegrationEventHandlers],
})
export class EventsModule {}
