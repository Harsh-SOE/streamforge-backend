import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { User } from '@gateway/services/auth/decorators';

import { VideoReactedResponse, GetLikesCountForVideo } from './response';
import { VideoReactionDto } from './request';
import { REACTION_API, REACTION_API_VERSION } from './api';

import { ReactionService } from './reaction.service';

@Controller('reaction')
@UseGuards(GatewayJwtGuard)
export class ReactionController {
  constructor(
    private likeService: ReactionService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(REACTION_API.REACT_VIDEO)
  @Version(REACTION_API_VERSION.V1)
  reactOnVideo(
    @User() loggedInUser: UserAuthPayload,
    @Query('videoId') videoId: string,
    @Body() likeStatus: VideoReactionDto,
  ): Promise<VideoReactedResponse> {
    this.counter.inc();
    return this.likeService.reactToVideo(loggedInUser.id, videoId, likeStatus);
  }

  @Post(REACTION_API.GET_LIKES_FOR_VIDEO)
  @Version(REACTION_API_VERSION.V1)
  getLikesCountForVideo(
    @Param('videoId') videoId: string,
  ): Promise<GetLikesCountForVideo> {
    this.counter.inc();
    return this.likeService.getLikesCountForVideo(videoId);
  }

  @Post(REACTION_API.GET_DISLIKES_FOR_VIDEO)
  @Version(REACTION_API_VERSION.V1)
  getDisLikesCountForVideo(
    @Param('videoId') videoId: string,
  ): Promise<GetLikesCountForVideo> {
    this.counter.inc();
    return this.likeService.getLikesCountForVideo(videoId);
  }
}
