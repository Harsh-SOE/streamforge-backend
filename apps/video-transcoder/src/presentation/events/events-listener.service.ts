import { Inject, OnModuleInit } from '@nestjs/common';

import { VIDEO_TRANSCODER_EVENTS } from '@app/common/events';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';
import { EVENT_CONSUMER_PORT, EventsConsumerPort } from '@app/common/ports/events';

import { VideoTranscoderService } from '../transcoder/video-transcoder.service';

export class EventsListenerService implements OnModuleInit {
  public constructor(
    @Inject(EVENT_CONSUMER_PORT) private readonly eventConsumer: EventsConsumerPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly videoTranscoderService: VideoTranscoderService,
  ) {}

  public async onModuleInit() {
    await this.eventConsumer.consumeMessage(async (event) => {
      switch (event.eventName) {
        case VIDEO_TRANSCODER_EVENTS.VIDEO_TRANSCODE_EVENT.toString(): {
          await this.videoTranscoderService.transcodeVideo(
            event.payload as VideoPublishedIntegrationEvent,
          );
          break;
        }
      }
    });
  }
}
