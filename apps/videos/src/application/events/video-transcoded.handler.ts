import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideoNotFoundException } from '@videos/application/exceptions';
import { VideoTranscodedDomainEvent } from '@videos/domain/domain-events';
import { VideoRepositoryAdapter } from '@videos/infrastructure/database/prisma/adapters';

@EventsHandler(VideoTranscodedDomainEvent)
export class VideoTranscodedEventHandler implements IEventHandler<VideoTranscodedDomainEvent> {
  constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videoRepoAdapter: VideoRepositoryAdapter,
  ) {}

  public async handle(videoTranscodedDomainEvent: VideoTranscodedDomainEvent) {
    const { payload } = videoTranscodedDomainEvent;

    const videoAggregate = await this.videoRepoAdapter.findOneVideoById(payload.videoId);

    if (!videoAggregate) {
      throw new VideoNotFoundException({
        message: `Video with id:${payload.videoId} was not found`,
      });
    }

    videoAggregate.updateDetails({});

    await this.videoRepoAdapter.updateOneVideoById(payload.videoId, videoAggregate);
  }
}
