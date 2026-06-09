import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoPublishedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { TRANSCODER_QUEUE_PORT, TranscoderQueuePort } from '@transcoder/application/ports';
@Injectable()
export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(TRANSCODER_QUEUE_PORT) private readonly queue: TranscoderQueuePort,
    @Inject(EVENT_CONSUMER_PORT) private readonly eventConsumer: EventsConsumerPort,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      switch (event.cause) {
        case 'VIDEO_TRANSCODE_EVENT': {
          const transcodeEvent = event as VideoPublishedIntegrationEvent;

          return await this.queue.enqueueTranscodeJob(transcodeEvent);
        }
      }
    });
  }
}
