import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { CommentAggregate } from '@comments/domain/aggregates';

import { Comment } from '@persistance/comments';

@Injectable()
export class CommentAggregatePersistance implements IAggregatePersistanceACL<
  CommentAggregate,
  Omit<Comment, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(persistance: Omit<Comment, 'createdAt' | 'updatedAt'>): CommentAggregate {
    return CommentAggregate.create({
      id: persistance.id,
      userId: persistance.commentedByUserId,
      videoId: persistance.commentedForVideoId,
      commentText: persistance.commentText,
    });
  }

  public toPersistance(aggregate: CommentAggregate): Omit<Comment, 'createdAt' | 'updatedAt'> {
    const entity = aggregate.getEntity();
    return {
      id: entity.getId(),
      commentedByUserId: entity.getUserId(),
      commentedForVideoId: entity.getVideoId(),
      commentText: entity.getCommentText(),
    };
  }
}
