import { Body, Controller, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { User } from '@gateway/common/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { REACTION_API_ENDPOINT, REACTION_API_VERSION } from '@gateway/common/endpoints';

import { VideoReactedResponse, GetLikesCountForVideo } from './response';
import { VideoReactionDto } from './request';
import { ReactionService } from './reaction.service';

@Controller(REACTION_API_ENDPOINT.ROOT)
@UseGuards(GatewayJwtGuard)
export class ReactionController {
  constructor(
    private likeService: ReactionService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(REACTION_API_ENDPOINT.REACT_VIDEO)
  @Version(REACTION_API_VERSION.VERSION_1)
  reactOnVideo(
    @User() loggedInUser: UserAuthPayload,
    @Query('videoId') videoId: string,
    @Body() likeStatus: VideoReactionDto,
  ): Promise<VideoReactedResponse> {
    this.counter.inc();
    return this.likeService.reactToVideo(loggedInUser.id, videoId, likeStatus);
  }

  @Post(REACTION_API_ENDPOINT.GET_LIKES_FOR_VIDEO)
  @Version(REACTION_API_VERSION.VERSION_1)
  getLikesCountForVideo(@Param('videoId') videoId: string): Promise<GetLikesCountForVideo> {
    this.counter.inc();
    return this.likeService.getLikesCountForVideo(videoId);
  }

  @Post(REACTION_API_ENDPOINT.GET_DISLIKES_FOR_VIDEO)
  @Version(REACTION_API_VERSION.VERSION_1)
  getDisLikesCountForVideo(@Param('videoId') videoId: string): Promise<GetLikesCountForVideo> {
    this.counter.inc();
    return this.likeService.getLikesCountForVideo(videoId);
  }
}
