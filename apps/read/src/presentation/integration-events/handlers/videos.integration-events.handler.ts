import { Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';

import {
  VIDEO_PROJECTION_REPOSITORY_PORT,
  VideoProjectionRepositoryPort,
} from '@read/application/ports';
import { VideoIntegrationToProjectionACL } from '@read/infrastructure/anti-corruption/intergration-to-projection';

export class VideosIntegrationEventsHandler {
  public constructor(
    @Inject(VIDEO_PROJECTION_REPOSITORY_PORT)
    private readonly videoProjectionRespository: VideoProjectionRepositoryPort,
    private readonly videoIntegrationToProjectionACL: VideoIntegrationToProjectionACL,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onVideoDraftSaved(videoDraftSavedIntegrationEvent: VideoDraftSavedIntegrationEvent) {
    const videoCreatorModel = this.videoIntegrationToProjectionACL.toVideoCreatorModel(
      videoDraftSavedIntegrationEvent,
    );
    await this.videoProjectionRespository.saveCreatorVideo(videoCreatorModel);
  }

  public async onVideoUploaded() {}

  public async onVideoProcessed() {}

  public async onVideoPublished() {}
}
