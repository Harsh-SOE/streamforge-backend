import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { ReactionAggregate } from '@reaction/domain/aggregates';

import { VideoReactions } from '@persistance/reaction';

@Injectable()
export class ReactionAggregatePersistanceACL implements IAggregatePersistanceACL<
  ReactionAggregate,
  Omit<VideoReactions, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(schema: Omit<VideoReactions, 'createdAt' | 'updatedAt'>): ReactionAggregate {
    return ReactionAggregate.create({
      id: schema.id,
      userId: schema.userId,
      videoId: schema.videoId,
      reactionStatus: schema.reactionStatus.toString(),
    });
  }

  public toPersistance(model: ReactionAggregate): Omit<VideoReactions, 'createdAt' | 'updatedAt'> {
    const entity = model.getSnapshot();
    return {
      id: entity.id,
      userId: entity.userId,
      videoId: entity.videoId,
      reactionStatus: entity.reactionStatus,
    };
  }
}
