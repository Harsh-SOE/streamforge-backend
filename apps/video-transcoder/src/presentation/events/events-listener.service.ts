import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';
import { VIDEO_EVENT_CAUSES, VideoVerifiedIntegrationEvent } from '@app/contracts/events/videos';

import { TRANSCODER_QUEUE_PORT, ProcessorQueuePort } from '@transcoder/application/ports';
@Injectable()
export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(TRANSCODER_QUEUE_PORT) private readonly queue: ProcessorQueuePort,
    @Inject(EVENT_CONSUMER_PORT) private readonly eventConsumer: EventsConsumerPort,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      switch (event.cause) {
        case VIDEO_EVENT_CAUSES.VIDEO_VERIFIED.toString(): {
          const videoVerifiedEvent = event as VideoVerifiedIntegrationEvent;
          return await this.queue.enqueueProcessingJob(videoVerifiedEvent);
        }
      }
    });
  }
}
