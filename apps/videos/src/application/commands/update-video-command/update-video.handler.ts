import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VideoUpdatedResponse } from '@app/contracts/videos';

import {
  TransportToDomainPublishEnumMapper,
  TransportToDomainVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption';
import { VideoNotFoundException } from '@videos/application/exceptions';
import { VIDEOS_RESPOSITORY_PORT, VideoRepositoryPort } from '@videos/application/ports';

import { UpdateVideoCommand } from './update-video.command';

@CommandHandler(UpdateVideoCommand)
export class UpdateVideoHandler implements ICommandHandler<UpdateVideoCommand> {
  public constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videoRepoAdapter: VideoRepositoryPort,
  ) {}

  public async execute({ updateVideoDto }: UpdateVideoCommand): Promise<VideoUpdatedResponse> {
    const {
      id,
      title,
      description,
      categories,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      videoTransportPublishStatus,
      videoTransportVisibilityStatus,
    } = updateVideoDto;

    const domainPublishStatus = videoTransportPublishStatus
      ? TransportToDomainPublishEnumMapper[videoTransportPublishStatus]
      : undefined;
    const domainVisibiltyStatus = videoTransportVisibilityStatus
      ? TransportToDomainVisibilityEnumMapper[videoTransportVisibilityStatus]
      : undefined;

    const videoAggregate = await this.videoRepoAdapter.findOneVideoById(id);

    if (!videoAggregate) {
      throw new VideoNotFoundException({ message: `Video with id:${id} was not found` });
    }

    videoAggregate.updateVideo({
      newTitle: title,
      newDescription: description,
      newPublishStatus: domainPublishStatus,
      newVisibilityStatus: domainVisibiltyStatus,
      newCategories: categories,
      newFileIdentifier: videoFileIdentifier,
      newThumbnailIdentifier: videoThumbnailIdentifier,
    });

    await this.videoRepoAdapter.updateOneVideoById(id, videoAggregate);

    return { response: 'video updated successfully', videoId: id };
  }
}
