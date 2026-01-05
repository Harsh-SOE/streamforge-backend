import { CommentAggregate } from '@comments/domain/aggregates';

export interface CommentBufferPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  bufferComment(comment: CommentAggregate): Promise<void>;
}

export const COMMENTS_BUFFER_PORT = Symbol('COMMENTS_BUFFER_PORT');
