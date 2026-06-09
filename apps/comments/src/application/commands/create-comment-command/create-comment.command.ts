import { CommentVideoDto } from '@app/contracts/protocols/comments';

export class CreateCommentCommand {
  constructor(public readonly createCommentDto: CommentVideoDto) {}
}
