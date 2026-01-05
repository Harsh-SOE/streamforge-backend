import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PlatformModule } from '@projection/infrastructure/platform/platform.module';

import { UsersEventsService } from './users-events.service';
import { VideoEventsService } from './video-events.service';
import { ChannelEventsService } from './channel-events.service';
import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [CqrsModule, PlatformModule],
  providers: [EventsListenerService, UsersEventsService, ChannelEventsService, VideoEventsService],
})
export class EventsModule {}
