import { CommentAggregate } from '@comments/domain/aggregates';

export interface CommentBufferPort {
  bufferComment(comment: CommentAggregate): Promise<void>;
}

export const COMMENTS_BUFFER_PORT = Symbol('COMMENTS_BUFFER_PORT');
