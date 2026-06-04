import { Inject, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';

export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(TRANSCODER_PORT) private readonly transcoder: TranscoderPort,
    @Inject(EVENT_CONSUMER_PORT) private readonly eventConsumer: EventsConsumerPort,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      switch (event.eventType) {
        case 'VIDEO_TRANSCODE_EVENT': {
          const transcodeEvent = event as VideoPublishedIntegrationEvent;
          return await this.transcoder.transcodeVideo({
            fileIdentifier: transcodeEvent.payload.fileIdentifier,
            videoId: transcodeEvent.payload.videoId,
          });
        }
      }
    });
  }
}
