import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { VideoWatchProjectionModel } from '@projection/infrastructure/repository/models';
import { VideoUpatedEventDto, VideoUploadedEventDto } from '@app/contracts/videos';

@Injectable()
export class VideoProjectionACL {
  public constructor(
    @InjectModel(VideoWatchProjectionModel.name)
    private readonly videoCard: Model<VideoWatchProjectionModel>,
  ) {}

  public videoUploadedEventToPersistance(event: VideoUploadedEventDto): VideoWatchProjectionModel {
    const videoCard = {
      videoId: event.videoId,
      channelId: event.channelId,
      ownerId: event.ownerId,
      ownerAvatar: event.ownerAvatar,
      ownerHandle: event.ownerHandle,
      title: event.title,
      thumbnailUrl: event.thumbnailUrl,
      videoUrl: event.videoUrl,
      categories: event.categories,
      views: event.views,
      commentsCount: event.commentsCount,
      durationSeconds: event.durationSeconds,
      likes: event.likes,
      visibility: event.visibility,
      searchTitle: event.searchTitle,
      publishedAt: event.publishedAt,
    };

    return new this.videoCard(videoCard);
  }

  public videoUpdatedEventToPersistance(
    event: VideoUpatedEventDto,
  ): Partial<VideoWatchProjectionModel> {
    const videoCard = {
      videoId: event.videoId,
      title: event.title,
      thumbnailUrl: event.thumbnailUrl,
      videoUrl: event.videoUrl,
      categories: event.categories,
      views: event.views,
      commentsCount: event.commentsCount,
      durationSeconds: event.durationSeconds,
      likes: event.likes,
      visibility: event.visibility,
    };

    return new this.videoCard(videoCard);
  }
}
