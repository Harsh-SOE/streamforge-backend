// TODO: Fix this video draft event consumption for projection saving
import { Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';

import {
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@read/application/ports';

export class VideoEventsService {
  public constructor(
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoProjectionRespository: VideoProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onVideoDraftSaved(videoPublishedIntegrationEvent: VideoDraftSavedIntegrationEvent) {
    // Implementation for handling video uploaded projection event
    this.logger.info(`saving video projection`);
    const { title, userId, videoId, channelId, visibility, description, categories } =
      videoPublishedIntegrationEvent.payload;
    await this.videoProjectionRespository.saveVideo({
      title,
      videoId,
      userId,
      channelId,
      categories,
      thumbnailIdentifier: '',
      fileIdentifier: '',
      visibility,
      description,
    });
  }
}
