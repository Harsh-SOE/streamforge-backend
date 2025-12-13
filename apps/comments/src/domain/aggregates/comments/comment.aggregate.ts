import { AggregateRoot } from '@nestjs/cqrs';

import { CommentEntity } from '../../entities';

export class CommentAggregate extends AggregateRoot {
  public constructor(private comment: CommentEntity) {
    super();
  }

  public static create(userId: string, videoId: string, commentText: string): CommentAggregate {
    const commentEntity = CommentEntity.create(userId, videoId, commentText);
    return new CommentAggregate(commentEntity);
  }

  public getComment() {
    return this.comment;
  }

  public getSnapshot() {
    return this.comment.getSnapshot();
  }
}
