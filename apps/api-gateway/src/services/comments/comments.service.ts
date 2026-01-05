import { ClientGrpc } from '@nestjs/microservices';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { SERVICES } from '@app/common';
import { COMMENT_SERVICE_NAME, CommentServiceClient } from '@app/contracts/comments';

import { CommentVideoResponse } from './response';

@Injectable()
export class CommentsService implements OnModuleInit {
  private commentsService: CommentServiceClient;

  constructor(@Inject(SERVICES.COMMENTS) private commentsClient: ClientGrpc) {}

  onModuleInit() {
    this.commentsService =
      this.commentsClient.getService<CommentServiceClient>(COMMENT_SERVICE_NAME);
  }
  async commentVideo(
    comment: string,
    userId: string,
    videoId: string,
  ): Promise<CommentVideoResponse> {
    const response$ = this.commentsService.commentService({
      comment,
      userId,
      videoId,
    });
    return await firstValueFrom(response$);
  }
}
