import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { VideoTranscodedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { IntegrationEventsConsumer } from './integration-events-consumer';

@Injectable()
export class IntegrationEventsListener implements OnModuleInit {
  public constructor(
    @Inject(EVENT_CONSUMER_PORT)
    private readonly eventConsumer: EventsConsumerPort,
    private readonly eventsService: IntegrationEventsConsumer,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      // react to all relevant messages here...
      switch (event.cause) {
        case 'VIDEO_TRANSCODED_EVENT': {
          await this.eventsService.onVideoTranscodedEventConsumer(
            event as VideoTranscodedIntegrationEvent,
          );
          break;
        }
      }
    });
  }
}
