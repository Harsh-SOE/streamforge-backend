import { Module } from '@nestjs/common';

import { PlatformModule } from '@transcoder/infrastructure/platform/platform.module';

import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [PlatformModule],
  providers: [EventsListenerService],
})
export class EventListenerModule {}
