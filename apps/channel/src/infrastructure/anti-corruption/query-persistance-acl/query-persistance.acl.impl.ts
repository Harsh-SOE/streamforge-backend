import { Injectable } from '@nestjs/common';

import { IQueryPersistanceACL } from '@app/ports/anti-corruption';

import { ChannelQueryModel } from '@channel/application/queries';

import { Channel } from '@peristance/channel';

@Injectable()
export class ChannelQueryPersistanceACL implements IQueryPersistanceACL<
  ChannelQueryModel,
  Omit<Channel, 'createdAt' | 'updatedAt'>
> {
  public toQueryModel(
    persistance: Omit<Channel, 'createdAt' | 'updatedAt'>,
  ): ChannelQueryModel {
    return {
      id: persistance.id,
      bio: persistance.bio,
      ChannelCoverImage: persistance.channelCoverImage,
      isChannelMonitized: persistance.isChannelMonitized,
      isChannelVerified: persistance.isChannelVerified,
      userId: persistance.userId,
    };
  }

  public toPersistance(
    entity: ChannelQueryModel,
  ): Omit<Channel, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      bio: entity.bio,
      channelCoverImage: entity.ChannelCoverImage,
      isChannelMonitized: entity.isChannelMonitized,
      isChannelVerified: entity.isChannelVerified,
      userId: entity.userId,
    };
  }
}
