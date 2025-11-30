import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VideoUpdatedResponse } from '@app/contracts/videos';

import {
  VIDEOS_COMMAND_RESPOSITORY_PORT,
  VIDEO_QUERY_RESPOSITORY_PORT,
  VideoCommandRepositoryPort,
  VideoQueryRepositoryPort,
} from '@videos/application/ports';
import {
  TransportToDomainPublishEnumMapper,
  TransportToDomainVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption';

import { EditVideoCommand } from './edit-video.command';

@CommandHandler(EditVideoCommand)
export class EditVideoHandler implements ICommandHandler<EditVideoCommand> {
  public constructor(
    @Inject(VIDEOS_COMMAND_RESPOSITORY_PORT)
    private readonly videoCommandAdapter: VideoCommandRepositoryPort,
    @Inject(VIDEO_QUERY_RESPOSITORY_PORT)
    private readonly videoQueryAdapter: VideoQueryRepositoryPort,
  ) {}

  public async execute({
    updateVideoDto,
  }: EditVideoCommand): Promise<VideoUpdatedResponse> {
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
      ? TransportToDomainPublishEnumMapper.get(videoTransportPublishStatus)
      : undefined;
    const domainVisibiltyStatus = videoTransportVisibilityStatus
      ? TransportToDomainVisibilityEnumMapper.get(
          videoTransportVisibilityStatus,
        )
      : undefined;

    const videoAggregate = await this.videoCommandAdapter.findOneById(id);

    videoAggregate.updateVideo({
      newTitle: title,
      newDescription: description,
      newPublishStatus: domainPublishStatus,
      newVisibilityStatus: domainVisibiltyStatus,
      newCategories: categories,
      newFileIdentifier: videoFileIdentifier,
      newThumbnailIdentifier: videoThumbnailIdentifier,
    });

    await this.videoCommandAdapter.updateOneById(id, videoAggregate);

    return { response: 'updated', videoId: id };
  }
}
