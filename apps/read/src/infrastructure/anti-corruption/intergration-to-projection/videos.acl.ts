import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { VideoCreatorReadModel } from '@read/infrastructure/repository/models/videos';

import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';

@Injectable()
export class VideoIntegrationToProjectionACL {
  public constructor(
    @InjectModel(VideoCreatorReadModel.name)
    private readonly videoCreator: Model<VideoCreatorReadModel>,
  ) {}

  public toVideoCreatorModel(
    videoDraftSavedIntegrationEvent: VideoDraftSavedIntegrationEvent,
  ): VideoCreatorReadModel {
    const {
      payload: { userId, videoId, channelId, title, categories, description },
    } = videoDraftSavedIntegrationEvent;

    return new this.videoCreator({
      userId,
      videoId,
      channelId,
      title,
      categories,
      description,
    });
  }
}
