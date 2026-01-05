import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  ChannelCreatedIntegrationEvent,
  ChannelUpdatedIntegrationEvent,
} from '@app/common/events/channel';

import { ChannelProjectionModel } from '@projection/infrastructure/repository/models';

@Injectable()
export class ChannelProjectionACL {
  public constructor(
    @InjectModel(ChannelProjectionModel.name)
    private readonly channelCard: Model<ChannelProjectionModel>,
  ) {}

  public channelCreatedEventToPersistance(
    event: ChannelCreatedIntegrationEvent,
  ): ChannelProjectionModel {
    const { channelId, userId, bio, coverImage } = event.payload;

    return new this.channelCard({
      userId,
      channelId,
      bio,
      coverImage,
    });
  }

  public channelUpdatedEventToPersistance(
    event: ChannelUpdatedIntegrationEvent,
  ): ChannelProjectionModel {
    const { channelId, userId, bio, coverImage } = event.payload;

    return new this.channelCard({
      userId,
      channelId,
      bio,
      coverImage,
    });
  }
}
