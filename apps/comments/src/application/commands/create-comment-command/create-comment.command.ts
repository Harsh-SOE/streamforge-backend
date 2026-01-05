import { CommentVideoDto } from '@app/contracts/comments';

export class CreateCommentCommand {
  constructor(public readonly createCommentDto: CommentVideoDto) {}
}
