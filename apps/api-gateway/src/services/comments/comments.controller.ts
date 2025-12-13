import { Body, Controller, Param, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { User } from '@gateway/services/auth/decorators';

import { COMMENT_API, COMMENT_API_VERSION } from './api';
import { CommentsService } from './comments.service';
import { CommentOnVideo } from './request';

@Controller('comments')
@UseGuards(GatewayJwtGuard)
export class CommentsController {
  constructor(
    private commentService: CommentsService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(COMMENT_API.COMMENT_ON_VIDEO)
  @Version(COMMENT_API_VERSION.V1)
  commentVideo(
    @Body() commentVideoDto: CommentOnVideo,
    @User() user: UserAuthPayload,
    @Param('videoId') videoId: string,
  ) {
    this.counter.inc();
    return this.commentService.commentVideo(commentVideoDto.comment, user.id, videoId);
  }
}
