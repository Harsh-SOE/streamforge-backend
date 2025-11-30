import { CommentAggregate } from '@comments/domain/aggregates';

export interface CommentRepositoryPort {
  save(model: CommentAggregate): Promise<CommentAggregate>;

  saveMany(model: CommentAggregate[]): Promise<number>;
}

export const COMMENTS_REPOSITORY_PORT = Symbol('COMMENTS_REPOSITORY_PORT');
