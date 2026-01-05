import { AggregateRoot } from '@nestjs/cqrs';

import { CommentCreatedDomainEvent } from '@comments/domain/domain-events';

import { CommentEntity } from '../../entities';
import { CommentsAggregateOptions } from './options';

export class CommentAggregate extends AggregateRoot {
  private constructor(private comment: CommentEntity) {
    super();
  }

  public static create(data: CommentsAggregateOptions): CommentAggregate {
    const { id, userId, videoId, commentText } = data;
    const commentEntity = CommentEntity.create({ id, userId, videoId, commentText });
    const commentAggregate = new CommentAggregate(commentEntity);

    const channelSnapshot = commentAggregate.getSnapshot();

    commentAggregate.apply(
      new CommentCreatedDomainEvent(
        channelSnapshot.id,
        channelSnapshot.userId,
        channelSnapshot.videoId,
        channelSnapshot.commentText,
      ),
    );
    return commentAggregate;
  }

  public getEntity() {
    return this.comment;
  }

  public getSnapshot() {
    return this.comment.getSnapshot();
  }
}
