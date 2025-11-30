import { DatabaseFilter } from '@app/common/types';

import { ChannelAggregate } from '@channel/domain/aggregates';

import { Channel } from '@peristance/channel';

export interface ChannelCommandRepositoryPort {
  save(domain: ChannelAggregate): Promise<ChannelAggregate>;

  saveMany(domains: ChannelAggregate[]): Promise<number>;

  findOneById(id: string): Promise<ChannelAggregate | null>;

  findOne(filter: DatabaseFilter<Channel>): Promise<ChannelAggregate | null>;

  findMany(filter: DatabaseFilter<Channel>): Promise<ChannelAggregate[]>;

  updateOneById(
    id: string,
    updates: ChannelAggregate,
  ): Promise<ChannelAggregate>;

  updateOne(
    filter: DatabaseFilter<Channel>,
    updates: ChannelAggregate,
  ): Promise<ChannelAggregate>;

  updateMany(
    filter: DatabaseFilter<Channel>,
    updates: ChannelAggregate,
  ): Promise<number>;

  deleteOneById(id: string): Promise<boolean>;

  deleteOne(filter: DatabaseFilter<Channel>): Promise<boolean>;

  deleteMany(filter: DatabaseFilter<Channel>): Promise<number>;
}

export const CHANNEL_COMMAND_REPOSITORY = Symbol('CHANNEL_COMMAND_REPOSITORY');
