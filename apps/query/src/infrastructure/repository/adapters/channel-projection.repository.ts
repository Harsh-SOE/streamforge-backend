import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ChannelQueryModel } from '@query/queries/models';
import { ChannelQueryRepositoryPort } from '@query/application/ports';
import { ChannelQueryACL } from '@query/infrastructure/anti-corruption';

import { ChannelProjectionModel } from '../models';

@Injectable()
export class ChannelProjectionRepository implements ChannelQueryRepositoryPort {
  constructor(
    @InjectModel(ChannelProjectionModel.name)
    private readonly projectedChannelModel: Model<ChannelProjectionModel>,
    private readonly channelQueryACL: ChannelQueryACL,
  ) {}

  public async getChannelFromId(id: string): Promise<ChannelQueryModel | null> {
    const channel = await this.projectedChannelModel.findById(id);

    return channel ? this.channelQueryACL.channelProjectionSchemaToQueryModel(channel) : null;
  }

  public async getChannelFromUserId(userId: string): Promise<ChannelQueryModel | null> {
    const channel = await this.projectedChannelModel.findOne({ userAuthId: userId });

    return channel ? this.channelQueryACL.channelProjectionSchemaToQueryModel(channel) : null;
  }
}
