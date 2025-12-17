import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChannelCreatedEventDto } from '@app/contracts/channel';

import { ChannelProjectionRepositoryPort } from '@projection/application/ports';
import { ChannelCardACL } from '@projection/infrastructure/anti-corruption';

import { ProjectedChannelModel } from '../models';

@Injectable()
export class ChannelCardRepository implements ChannelProjectionRepositoryPort {
  constructor(
    @InjectModel(ProjectedChannelModel.name)
    private readonly projectedVideoCard: Model<ProjectedChannelModel>,
    private readonly channelCardACL: ChannelCardACL,
  ) {}

  public async saveChannel(data: ChannelCreatedEventDto): Promise<boolean> {
    await this.projectedVideoCard.create(
      this.channelCardACL.channelCreatedEventToPersistance(data),
    );

    return true;
  }

  async saveManyChannels(event: ChannelCreatedEventDto[]): Promise<number> {
    const data = event.map((data) => this.channelCardACL.channelCreatedEventToPersistance(data));
    const savedCards = await this.projectedVideoCard.insertMany(data);

    return savedCards.length;
  }

  public async updateChannel(videoId: string, event: ChannelCreatedEventDto): Promise<boolean> {
    const updated = await this.projectedVideoCard.findOneAndUpdate(
      { videoId },
      { $set: this.channelCardACL.channelCreatedEventToPersistance(event) },
      { new: true },
    );

    return updated ? true : false;
  }

  public async deleteChannel(videoId: string): Promise<boolean> {
    const result = await this.projectedVideoCard.deleteOne({ videoId });
    return result.acknowledged;
  }
}
