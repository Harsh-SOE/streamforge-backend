import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentVideoResponse } from '@app/contracts/comments';

import {
  COMMENTS_BUFFER_PORT,
  CommentBufferPort,
  COMMENTS_CACHE_PORT,
  CommentCachePort,
} from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';

import { CreateCommentCommand } from './create-comment.command';

@CommandHandler(CreateCommentCommand)
export class CreateCommentCommandHandler implements ICommandHandler<
  CreateCommentCommand,
  CommentVideoResponse
> {
  public constructor(
    @Inject(COMMENTS_BUFFER_PORT) private buffer: CommentBufferPort,
    @Inject(COMMENTS_CACHE_PORT) private cache: CommentCachePort,
  ) {}

  public async execute({ createCommentDto }: CreateCommentCommand): Promise<CommentVideoResponse> {
    const { comment, userId, videoId } = createCommentDto;

    const commentAggregate = CommentAggregate.create({ userId, videoId, commentText: comment });

    const result = await this.cache.incrementCommentsCounter(videoId, userId);

    if (result === 0) {
      return { response: 'already commented' };
    }

    await this.buffer.bufferComment(commentAggregate);

    return { response: `Commented on video: ${videoId}` };
  }
}
