import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VideoUpdatedResponse } from '@app/contracts/protocols/videos';

import { TransportToDomainVisibilityEnumMapper } from '@videos/infrastructure/anti-corruption';
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
      fileIdentifier,
      thumbnailIdentifier,
      videoVisibilityState,
    } = updateVideoDto;

    const domainVisibiltyState = videoVisibilityState
      ? TransportToDomainVisibilityEnumMapper[videoVisibilityState]
      : undefined;

    const videoAggregate = await this.videoRepoAdapter.findOneVideoById(id);

    if (!videoAggregate) {
      throw new VideoNotFoundException({ message: `Video with id:${id} was not found` });
    }

    videoAggregate.updateVideo({
      newTitle: title,
      newDescription: description,
      newVisibilityState: domainVisibiltyState,
      newCategories: categories,
      newFileIdentifier: fileIdentifier,
      newThumbnailIdentifier: thumbnailIdentifier,
    });

    await this.videoRepoAdapter.updateOneVideoById(id, videoAggregate);

    return { response: 'video updated successfully', videoId: id };
  }
}
