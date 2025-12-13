import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentVideoDto, CommentVideoResponse } from '@app/contracts/comments';

import { CreateCommentCommand } from '@comments/application/commands';

@Injectable()
export class GrpcService {
  public constructor(private readonly commandBus: CommandBus) {}

  public async commentOnVideo(commentVideoDto: CommentVideoDto): Promise<CommentVideoResponse> {
    return this.commandBus.execute<CreateCommentCommand, CommentVideoResponse>(
      new CreateCommentCommand(commentVideoDto),
    );
  }
}
