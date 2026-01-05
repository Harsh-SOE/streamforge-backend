import { CreateCommentCommandHandler } from './create-comment-command/create-comment.handler';

export const CommentCommandHandler = [CreateCommentCommandHandler];

export * from './create-comment-command/create-comment.command';
export * from './create-comment-command/create-comment.handler';
