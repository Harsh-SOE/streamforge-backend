import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { VideosConfigModule } from '@videos/infrastructure/config';
import { VideoEventHandler } from '@videos/application/integration-events';

import { EventsService } from './events.service';
import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [CqrsModule, VideosConfigModule],
  providers: [EventsService, EventsListenerService, ...VideoEventHandler],
})
export class EventsModule {}
