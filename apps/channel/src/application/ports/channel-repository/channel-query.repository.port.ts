import { DatabaseFilter } from '@app/common/types';

import { ChannelQueryModel } from '@channel/application/queries';

import { Channel } from '@peristance/channel';

export interface ChannelQueryRepositoryPort {
  findById(id: string): Promise<ChannelQueryModel | null>;

  findOne(filter: DatabaseFilter<Channel>): Promise<ChannelQueryModel | null>;

  findMany(filter: DatabaseFilter<Channel>): Promise<ChannelQueryModel[]>;
}

export const CHANNEL_QUERY_REPOSITORY = Symbol('CHANNEL_QUERY_REPOSITORY');
