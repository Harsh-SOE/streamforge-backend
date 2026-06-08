import { Module } from '@nestjs/common';

import { UserIntegrationEventHandlers } from '@users/application/events';

import { EventsService } from './events-listener.service';
import { EventsListenerService } from './event-listener.service';

@Module({
  providers: [EventsService, EventsListenerService, ...UserIntegrationEventHandlers],
})
export class EventsModule {}
