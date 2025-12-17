import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChannelCreatedEventDto } from '@app/contracts/channel';

import { ProjectedChannelModel } from '@projection/infrastructure/repository/models';

@Injectable()
export class ChannelCardACL {
  public constructor(
    @InjectModel(ProjectedChannelModel.name)
    private readonly channelCard: Model<ProjectedChannelModel>,
  ) {}

  public channelCreatedEventToPersistance(event: ChannelCreatedEventDto): ProjectedChannelModel {
    return new this.channelCard({
      userId: event.userId,
      channelId: event.id,
      bio: event.bio,
      handle: event.handle,
      coverImage: event.coverImage,
    });
  }
}
