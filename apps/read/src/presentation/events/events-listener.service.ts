import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';
import { ChannelCreatedProjectionEvent } from '@app/common/events/projections';
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
          await this.usersEventService.onUserProfileOnBoarded(event as UserProjectionEvent);
          break;
        }
        case PROJECTION_EVENTS.USER_PROFILE_UPDATED_PROJECTION_EVENT.toString(): {
          break;
        }
        case PROJECTION_EVENTS.CHANNEL_CREATED_PROJECTION_EVENT.toString(): {
          await this.channelEventsService.onChannelCreated(
            event.payload as ChannelCreatedProjectionEvent,
          );
          break;
        }
        case PROJECTION_EVENTS.VIDEO_PUBLISHED_PROJECTION_EVENT.toString(): {
          await this.videoEventsService.onVideoPublished(
            event.payload as VideoPublishedIntegrationEvent,
          );
          break;
        }
      }
    });
  }
}
