import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject, Injectable, NotImplementedException, OnModuleInit } from '@nestjs/common';

import { SERVICES } from '@app/common';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { REACTION_SERVICE_NAME, ReactionServiceClient } from '@app/contracts/protocols/reaction';

import { VideoReactionDto } from './request';
import { ClientTransportLikeStatusEnumMapper } from './mappers/like-status';
import { GetLikesCountForVideo, GetDislikesCountForVideo, VideoReactedResponse } from './response';

@Injectable()
export class ReactionService implements OnModuleInit {
  private reactionService: ReactionServiceClient;

  constructor(
    @Inject(SERVICES.REACTION) private reactionClient: ClientGrpc,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.reactionService = this.reactionClient.getService(REACTION_SERVICE_NAME);
  }

  async reactToVideo(
    userId: string,
    videoId: string,
    videoLikeStatusCreatedDto: VideoReactionDto,
  ): Promise<VideoReactedResponse> {
    this.logger.info(`Request recieved:${userId}`);

    const reactionStatusForService =
      ClientTransportLikeStatusEnumMapper[videoLikeStatusCreatedDto.reactionStatus];

    const response$ = this.reactionService.reactToVideo({
      userId,
      videoId,
      reaction: reactionStatusForService,
    });
    return await firstValueFrom(response$);
  }

  getLikesCountForVideo(videoId: string): Promise<GetLikesCountForVideo> {
    throw new NotImplementedException(`Please implement 'getLikesCountForVideo' for ${videoId}`);
  }

  getDislikesCountForVideo(videoId: string): Promise<GetDislikesCountForVideo> {
    throw new NotImplementedException(`Please implement 'getDislikesCountForVideo' for ${videoId}`);
  }
}
