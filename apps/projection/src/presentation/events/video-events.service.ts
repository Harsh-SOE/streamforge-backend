import { Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@projection/application/ports';
import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

export class VideoEventsService {
  public constructor(
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoProjectionRespository: VideoProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onVideoPublished(videoPublishedIntegrationEvent: VideoPublishedIntegrationEvent) {
    // Implementation for handling video uploaded projection event
    this.logger.info(`saving video projection`);
    await this.videoProjectionRespository.saveVideo(videoPublishedIntegrationEvent);
  }
}
