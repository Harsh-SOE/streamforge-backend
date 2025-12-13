import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { ReactionAggregate } from '@reaction/domain/aggregates';
import { ReactionEntity } from '@reaction/domain/entities';
import { ReactionStatus, UserId, VideoId } from '@reaction/domain/value-objects';

import { VideoReactions } from '@peristance/reaction';

@Injectable()
export class ReactionPersistanceACL implements IAggregatePersistanceACL<
  ReactionAggregate,
  Omit<VideoReactions, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(schema: Omit<VideoReactions, 'createdAt' | 'updatedAt'>): ReactionAggregate {
    const reactionEntity = new ReactionEntity(
      schema.id,
      UserId.create(schema.userId),
      VideoId.create(schema.videoId),
      ReactionStatus.create(schema.reactionStatus),
    );
    return new ReactionAggregate(reactionEntity);
  }

  public toPersistance(model: ReactionAggregate): Omit<VideoReactions, 'createdAt' | 'updatedAt'> {
    return {
      id: model.getEntity().getId(),
      userId: model.getEntity().getUserId(),
      videoId: model.getEntity().getVideoId(),
      reactionStatus: model.getEntity().getReactionStatus(),
    };
  }
}
