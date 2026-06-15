import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { VideoDraftSavedResponse } from '@app/contracts/protocols/videos';

import {
  STORAGE_PORT,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
  VideosStoragePort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';

import { VideoSaveDraftCommand } from './video-save-draft.command';

@CommandHandler(VideoSaveDraftCommand)
export class VideoSaveDraftHandler implements ICommandHandler<VideoSaveDraftCommand> {
  constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videoRepository: VideoRepositoryPort,
    @Inject(STORAGE_PORT) private readonly storage: VideosStoragePort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ videoSaveDraftDto }: VideoSaveDraftCommand): Promise<VideoDraftSavedResponse> {
    const { userId, channelId, title, categories, description } = videoSaveDraftDto;
    const id = uuidv4();

    const videoAggregate = this.eventPublisher.mergeObjectContext(
      VideoAggregate.createFromDraft({
        id,
        ownerId: userId,
        channelId,
        title,
        categories,
        description,
      }),
    );

    await this.videoRepository.saveVideo(videoAggregate);

    const videoPresignedResponse = await this.storage.getPresignedUrlForVideo(id);
    const thumbnailPresignedResponse = await this.storage.getPresignedUrlForThumbnail(id);

    const videoPresignedUrl = videoPresignedResponse.presignedUrl;
    const thumbnailPresignedUrl = thumbnailPresignedResponse.presignedUrl;

    videoAggregate.commit();

    return {
      id,
      videoFilePresignedUrl: videoPresignedUrl,
      thumbnailFilePresignedUrl: thumbnailPresignedUrl,
    };
  }
}
