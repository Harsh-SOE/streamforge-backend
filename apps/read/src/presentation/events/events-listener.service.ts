import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VIDEO_EVENT_CAUSES, VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';
import { USER_EVENT_CAUSES, UserOnboardedIntegrationEvent } from '@app/contracts/events/users';
import {
  CHANNEL_EVENT_CAUSES,
  ChannelCreatedIntegrationEvent,
} from '@app/contracts/events/channel';

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
      switch (event.cause) {
        case USER_EVENT_CAUSES.USER_ONBOARDED_INTEGRATION_EVENT.toString(): {
          await this.usersEventService.onUserProfileOnBoarded(
            event as UserOnboardedIntegrationEvent,
          );
          break;
        }
        case USER_EVENT_CAUSES.USER_PROFILE_UPDATED_INTEGRATION_EVENT.toString(): {
          break;
        }
        case CHANNEL_EVENT_CAUSES.CHANNEL_CREATED.toString(): {
          await this.channelEventsService.onChannelCreated(
            event.payload as ChannelCreatedIntegrationEvent,
          );
          break;
        }
        case VIDEO_EVENT_CAUSES.VIDEO_PUBLISHED.toString(): {
          await this.videoEventsService.onVideoPublished(
            event.payload as VideoDraftSavedIntegrationEvent,
          );
          break;
        }
      }
    });
  }
}
