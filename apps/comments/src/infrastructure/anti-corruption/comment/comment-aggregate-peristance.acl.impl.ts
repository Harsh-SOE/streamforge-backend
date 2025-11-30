import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { CommentAggregate } from '@comments/domain/aggregates';
import { CommentEntity } from '@comments/domain/entities';
import { CommentText, UserId, VideoId } from '@comments/domain/value-objects';

import { Comment } from '@peristance/comments';

@Injectable()
export class CommentAggregatePersistance implements IAggregatePersistanceACL<
  CommentAggregate,
  Omit<Comment, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(
    persistance: Omit<Comment, 'createdAt' | 'updatedAt'>,
  ): CommentAggregate {
    const commentEntity = new CommentEntity(
      persistance.id,
      UserId.create(persistance.commentedByUserId),
      VideoId.create(persistance.commentedForVideoId),
      CommentText.create(persistance.commentText),
    );
    return new CommentAggregate(commentEntity);
  }

  public toPersistance(
    aggregate: CommentAggregate,
  ): Omit<Comment, 'createdAt' | 'updatedAt'> {
    return {
      id: aggregate.getComment().getId(),
      commentedByUserId: aggregate.getComment().getUserId(),
      commentedForVideoId: aggregate.getComment().getVideoId(),
      commentText: aggregate.getComment().getCommentText(),
    };
  }
}
