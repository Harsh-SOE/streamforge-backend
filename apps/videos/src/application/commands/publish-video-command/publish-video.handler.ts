import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { VideoPublishedResponse } from '@app/contracts/videos';

import {
  TransportToDomainPublishEnumMapper,
  TransportToDomainVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption';
import { VideoAggregate } from '@videos/domain/aggregates';
import { VIDEOS_RESPOSITORY_PORT, VideoRepositoryPort } from '@videos/application/ports';

import { PublishVideoCommand } from './publish-video.command';

@CommandHandler(PublishVideoCommand)
export class PublishVideoHandler implements ICommandHandler<PublishVideoCommand> {
  constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly video: VideoRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ videoCreateDto }: PublishVideoCommand): Promise<VideoPublishedResponse> {
    const {
      ownerId,
      channelId,
      title,
      videoThumbnailIdentifier,
      videoFileIdentifier,
      categories,
      description,
      videoTransportPublishStatus,
      videoTransportVisibilityStatus,
    } = videoCreateDto;
    const id = uuidv4();

    const videoDomainPublishStatus =
      TransportToDomainPublishEnumMapper[videoTransportPublishStatus];

    const videoDomainVisibilityStatus =
      TransportToDomainVisibilityEnumMapper[videoTransportVisibilityStatus];

    const videoAggregate = this.eventPublisher.mergeObjectContext(
      VideoAggregate.create({
        id,
        ownerId,
        channelId,
        title,
        videoFileIdentifier,
        videoThumbnailIdentifier,
        categories,
        publishStatus: videoDomainPublishStatus,
        visibilityStatus: videoDomainVisibilityStatus,
        description,
      }),
    );

    await this.video.saveVideo(videoAggregate);

    videoAggregate.commit();

    return { response: 'video created successfully', videoId: id };
  }
}
