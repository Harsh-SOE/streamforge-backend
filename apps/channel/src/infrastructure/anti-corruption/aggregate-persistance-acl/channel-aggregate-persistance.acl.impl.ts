import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { Channel } from '@persistance/channel';

import { ChannelAggregate } from '@channel/domain/aggregates';

@Injectable()
export class ChannelAggregatePersistanceACL implements IAggregatePersistanceACL<
  ChannelAggregate,
  Omit<Channel, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(schema: Omit<Channel, 'createdAt' | 'updatedAt'>): ChannelAggregate {
    const channelAggregate = ChannelAggregate.create({
      id: schema.id,
      userId: schema.userId,
      bio: schema.bio ?? undefined,
      coverImage: schema.channelCoverImage ?? undefined,
      isChannelMonitized: schema.isChannelMonitized ?? undefined,
      isChannelVerified: schema.isChannelVerified ?? undefined,
    });

    return channelAggregate;
  }

  public toPersistance(aggregate: ChannelAggregate): Omit<Channel, 'createdAt' | 'updatedAt'> {
    const aggregateSnapshot = aggregate.getChannelSnapshot();
    return {
      id: aggregateSnapshot.id,
      userId: aggregateSnapshot.userId,
      bio: aggregateSnapshot.bio ?? null,
      channelCoverImage: aggregateSnapshot.coverImage ?? null,
      isChannelMonitized: aggregateSnapshot.isChannelMonitized ?? null,
      isChannelVerified: aggregateSnapshot.isChannelVerified ?? null,
    };
  }
}
