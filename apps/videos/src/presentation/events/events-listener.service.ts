import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { VIDEO_TRANSCODER_EVENTS } from '@app/common/events';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';
import { VideoTranscodedIntegrationEvent } from '@app/common/events/videos';

import { EventsService } from './events.service';

@Injectable()
export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(EVENT_CONSUMER_PORT)
    private readonly eventConsumer: EventsConsumerPort,
    private readonly eventsService: EventsService,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      // react to all relevant messages here...
      switch (event.eventName) {
        case VIDEO_TRANSCODER_EVENTS.VIDEO_TRANSCODED_EVENT.toString(): {
          await this.eventsService.onVideoTranscoded(event as VideoTranscodedIntegrationEvent);
          break;
        }
      }
    });
  }
}
