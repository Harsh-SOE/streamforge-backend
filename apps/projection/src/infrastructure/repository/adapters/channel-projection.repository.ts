import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChannelProjectionRepositoryPort } from '@projection/application/ports';
import { ChannelProjectionACL } from '@projection/infrastructure/anti-corruption';

import { ChannelProjectionModel } from '../models';
import {
  ChannelCreatedIntegrationEvent,
  ChannelUpdatedIntegrationEvent,
} from '@app/common/events/channel';

@Injectable()
export class ChannelProjectionRepository implements ChannelProjectionRepositoryPort {
  constructor(
    @InjectModel(ChannelProjectionModel.name)
    private readonly projectedVideoCard: Model<ChannelProjectionModel>,
    private readonly channelCardACL: ChannelProjectionACL,
  ) {}

  public async saveChannel(data: ChannelCreatedIntegrationEvent): Promise<boolean> {
    await this.projectedVideoCard.create(
      this.channelCardACL.channelCreatedEventToPersistance(data),
    );

    return true;
  }

  async saveManyChannels(event: ChannelCreatedIntegrationEvent[]): Promise<number> {
    const data = event.map((data) => this.channelCardACL.channelCreatedEventToPersistance(data));
    const savedCards = await this.projectedVideoCard.insertMany(data);

    return savedCards.length;
  }

  public async updateChannel(
    videoId: string,
    event: ChannelUpdatedIntegrationEvent,
  ): Promise<boolean> {
    const updated = await this.projectedVideoCard.findOneAndUpdate(
      { videoId },
      { $set: this.channelCardACL.channelUpdatedEventToPersistance(event) },
      { new: true },
    );

    return updated ? true : false;
  }

  public async deleteChannel(videoId: string): Promise<boolean> {
    const result = await this.projectedVideoCard.deleteOne({ videoId });
    return result.acknowledged;
  }
}
