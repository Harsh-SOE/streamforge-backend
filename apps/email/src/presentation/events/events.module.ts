import { Module } from '@nestjs/common';

import { EmailConfigModule } from '@email/infrastructure/config';

import { EventsService } from './events.service';
import { EventsListener } from './event-listener.service';

@Module({
  imports: [EmailConfigModule],
  providers: [EventsService, EventsListener],
})
export class EventsModule {}
