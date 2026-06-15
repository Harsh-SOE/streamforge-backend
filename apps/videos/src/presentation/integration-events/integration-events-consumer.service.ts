import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { VideoProcessedIntegrationEvent } from '@app/contracts/events/videos';
import {
  INTEGRATION_EVENT_CONSUMER_PORT,
  IntegrationEventsConsumerPort,
} from '@app/common/ports/events';

import { VideosIntegrationEventHandler } from './handlers/videos-integration-event.handler';

@Injectable()
export class IntegrationEventsConsumerService implements OnModuleInit {
  public constructor(
    @Inject(INTEGRATION_EVENT_CONSUMER_PORT)
    private readonly eventConsumer: IntegrationEventsConsumerPort,
    private readonly eventsService: VideosIntegrationEventHandler,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      // react to all relevant messages here...
      switch (event.cause) {
        case 'VIDEO_TRANSCODED_EVENT': {
          await this.eventsService.onVideoTranscodedEventConsumer(
            event as VideoProcessedIntegrationEvent,
          );
          break;
        }

        // case 'VIDEO_METADATA_SAVED_EVENT': {
        // }
      }
    });
  }
}
