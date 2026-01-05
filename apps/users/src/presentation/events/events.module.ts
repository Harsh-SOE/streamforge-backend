import { Module } from '@nestjs/common';

import { EventsService } from './events.service';
import { EventsListener } from './event-listener.service';

@Module({
  providers: [EventsService, EventsListener],
})
export class EventsModule {}
