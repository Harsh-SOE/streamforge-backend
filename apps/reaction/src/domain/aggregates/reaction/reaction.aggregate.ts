import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { ReactionStatus, UserId, VideoId } from '@reaction/domain/value-objects';
import { ReactionDomainStatus } from '@reaction/domain/enums';

import { ReactionEntity } from '../../entities/reaction/reaction.entity';

export class ReactionAggregate extends AggregateRoot {
  public constructor(private readonly reactionEntity: ReactionEntity) {
    super();
  }

  public static create(userId: string, videoId: string, reactionStatus: ReactionDomainStatus) {
    const reactionEntity = new ReactionEntity(
      uuidv4(),
      UserId.create(userId),
      VideoId.create(videoId),
      ReactionStatus.create(reactionStatus),
    );
    return new ReactionAggregate(reactionEntity);
  }

  public getSnapshot() {
    return this.reactionEntity.getSnapshot();
  }

  public getEntity() {
    return this.reactionEntity;
  }

  public updateReactionStatus(newReactionStatus: string) {
    return this.reactionEntity.updateReactionStatus(newReactionStatus);
  }
}
