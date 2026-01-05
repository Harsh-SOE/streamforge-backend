import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

import { VideoWatchProjectionModel } from '@projection/infrastructure/repository/models';

@Injectable()
export class VideoProjectionACL {
  public constructor(
    @InjectModel(VideoWatchProjectionModel.name)
    private readonly videoCard: Model<VideoWatchProjectionModel>,
  ) {}

  public videoUploadedEventToPersistance(
    event: VideoPublishedIntegrationEvent,
  ): VideoWatchProjectionModel {
    const {
      videoId,
      userId,
      channelId,
      title,
      fileIdentifier,
      thumbnailIdentifier,
      categories,
      visibility,
      description,
    } = event.payload;

    const videoCard = {
      videoId,
      userId,
      channelId,
      title,
      thumbnailUrl: thumbnailIdentifier,
      videoUrl: fileIdentifier,
      durationSeconds: 500,
      publishedAt: new Date(),
      categories,
      visibility,
      description,
    };

    return new this.videoCard(videoCard);
  }

  /*
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
  */
}
