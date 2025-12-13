import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { VideoPublishedResponse } from '@app/contracts/videos';

import {
  VIDEOS_COMMAND_RESPOSITORY_PORT,
  VideoCommandRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';
import {
  TransportToDomainPublishEnumMapper,
  TransportToDomainVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption';

import { PublishVideoCommand } from './publish-video.command';

@CommandHandler(PublishVideoCommand)
export class PublishVideoHandler implements ICommandHandler<PublishVideoCommand> {
  constructor(
    @Inject(VIDEOS_COMMAND_RESPOSITORY_PORT)
    private readonly video: VideoCommandRepositoryPort,
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

    const videoDomainPublishStatus = TransportToDomainPublishEnumMapper.get(
      videoTransportPublishStatus,
    );

    const videoDomainVisibilityStatus = TransportToDomainVisibilityEnumMapper.get(
      videoTransportVisibilityStatus,
    );

    if (!videoDomainPublishStatus || !videoDomainVisibilityStatus) {
      throw Error();
    }

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

    await this.video.save(videoAggregate);

    videoAggregate.commit(); // publishes message to transcoder service...

    return { response: 'created', videoId: id };
  }
}
