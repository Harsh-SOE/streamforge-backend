import { Body, Controller, Param, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { User } from '@gateway/common/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { COMMENT_API_ENDPOINT, COMMENT_API_VERSION } from '@gateway/common/endpoints';

import { CommentsService } from './comments.service';
import { CommentOnVideo } from './request';

@Controller(COMMENT_API_ENDPOINT.ROOT)
@UseGuards(GatewayJwtGuard)
export class CommentsController {
  constructor(
    private commentService: CommentsService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(COMMENT_API_ENDPOINT.COMMENT_ON_VIDEO)
  @Version(COMMENT_API_VERSION.VERSION_1)
  commentVideo(
    @Body() commentVideoDto: CommentOnVideo,
    @User() user: UserAuthPayload,
    @Param('videoid') videoId: string,
  ) {
    this.counter.inc();
    return this.commentService.commentVideo(commentVideoDto.comment, user.id, videoId);
  }
}
