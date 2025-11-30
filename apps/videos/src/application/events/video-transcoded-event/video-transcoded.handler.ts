import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VIDEOS_COMMAND_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideoCommandRepositoryAdapter } from '@videos/infrastructure/repository/adapters';

import { VideoTranscodedEvent } from './video-transcoded.event';

@EventsHandler(VideoTranscodedEvent)
export class VideoTranscodedEventHandler implements IEventHandler<VideoTranscodedEvent> {
  constructor(
    @Inject(VIDEOS_COMMAND_RESPOSITORY_PORT)
    private videoRepoAdapter: VideoCommandRepositoryAdapter,
  ) {}

  public async handle({ videoTranscodedMessage }: VideoTranscodedEvent) {
    const { videoId, newIdentifier } = videoTranscodedMessage;

    const videoAggregate = await this.videoRepoAdapter.findOneById(videoId);

    videoAggregate.updateVideo({ newFileIdentifier: newIdentifier });

    await this.videoRepoAdapter.updateOneById(videoId, videoAggregate);
  }
}
