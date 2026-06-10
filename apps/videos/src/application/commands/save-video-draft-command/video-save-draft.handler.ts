import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { VideoDraftSavedResponse } from '@app/contracts/protocols/videos';

import { VideoAggregate } from '@videos/domain/aggregates';
import {
  STORAGE_PORT,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
  VideosStoragePort,
} from '@videos/application/ports';

import { VideoSaveDraftCommand } from './video-save-draft.command';

@CommandHandler(VideoSaveDraftCommand)
export class VideoSaveDraftHandler implements ICommandHandler<VideoSaveDraftCommand> {
  constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly video: VideoRepositoryPort,
    @Inject(STORAGE_PORT) private readonly storage: VideosStoragePort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ videoSaveDraftDto }: VideoSaveDraftCommand): Promise<VideoDraftSavedResponse> {
    const { userId, channelId, title, categories, description } = videoSaveDraftDto;
    const id = uuidv4();

    // create presigned URL

    const thumbnailIdentifier = (
      await this.storage.getPresignedUrlForThumbnail(`/videos/original/${id}`)
    ).presignedUrl;
    const fileIdentifier = (await this.storage.getPresignedUrlForVideo(`/videos/original/${id}`))
      .presignedUrl;

    const videoAggregate = this.eventPublisher.mergeObjectContext(
      VideoAggregate.create({
        id,
        userId,
        channelId,
        title,
        categories,
        description,
      }),
    );

    await this.video.saveVideo(videoAggregate);

    videoAggregate.commit();

    return {
      id,
      fileIdentifier,
      thumbnailIdentifier,
    };
  }
}
