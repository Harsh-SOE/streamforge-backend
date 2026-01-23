import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ProfileUpdatedIntegrationEvent } from '@app/common/events/users';
import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';
import { ChannelCreatedIntegrationEvent } from '@app/common/events/channel';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';
import { PROJECTION_EVENTS, UserProjectionEvent } from '@app/common/events/projections';

import { UsersEventsService } from './users-events.service';
import { VideoEventsService } from './video-events.service';
import { ChannelEventsService } from './channel-events.service';

@Injectable()
export class EventsListenerService implements OnModuleInit {
  constructor(
    @Inject(EVENT_CONSUMER_PORT) private readonly eventConsumer: EventsConsumerPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly usersEventService: UsersEventsService,
    private readonly channelEventsService: ChannelEventsService,
    private readonly videoEventsService: VideoEventsService,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      this.logger.info(`projection event recieved`, event);
      switch (event.eventType) {
        case PROJECTION_EVENTS.USER_ONBOARDED_PROJECTION_EVENT.toString(): {
          this.logger.info(`Saving user projection`);
          await this.usersEventService.onUserProfileOnBoarded(event as UserProjectionEvent);
          break;
        }
        case 'USER_PROFILE_UPDATED_EVENT': {
          await this.usersEventService.onUserProfileUpdated(
            event.payload as ProfileUpdatedIntegrationEvent,
          );
          break;
        }
        case 'CHANNEL_CREATED': {
          await this.channelEventsService.onChannelCreated(
            event.payload as ChannelCreatedIntegrationEvent,
          );
          break;
        }
        case 'VIDEO_PUBLISHED_EVENT': {
          await this.videoEventsService.onVideoPublished(
            event.payload as VideoPublishedIntegrationEvent,
          );
          break;
        }
      }
    });
  }
}
