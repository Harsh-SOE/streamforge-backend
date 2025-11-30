import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { Channel } from '@peristance/channel';

import { ChannelAggregate } from '@channel/domain/aggregates';
import { ChannelEntity } from '@channel/domain/entities';
import {
  ChannelBio,
  ChannelCoverImage,
  ChannelUserId,
} from '@channel/domain/value-objects';

@Injectable()
export class ChannelAggregatePersistanceACL implements IAggregatePersistanceACL<
  ChannelAggregate,
  Omit<Channel, 'createdAt' | 'updatedAt'>
> {
  toAggregate(
    schema: Omit<Channel, 'createdAt' | 'updatedAt'>,
  ): ChannelAggregate {
    const channelEntity = new ChannelEntity(
      schema.id,
      ChannelUserId.create(schema.userId),
      ChannelBio.create(schema.bio ?? undefined),
      ChannelCoverImage.create(schema.channelCoverImage ?? undefined),
      schema.isChannelMonitized ?? undefined,
      schema.isChannelVerified ?? undefined,
    );
    return new ChannelAggregate(channelEntity);
  }

  toPersistance(
    model: ChannelAggregate,
  ): Omit<Channel, 'createdAt' | 'updatedAt'> {
    return {
      id: model.getChannelSnapshot().id,
      userId: model.getChannelSnapshot().userId,
      bio: model.getChannelSnapshot().bio ?? null,
      channelCoverImage: model.getChannelSnapshot().coverImage ?? null,
      isChannelMonitized: model.getChannelSnapshot().isChannelMonitized ?? null,
      isChannelVerified: model.getChannelSnapshot().isChannelVerified ?? null,
    };
  }
}
