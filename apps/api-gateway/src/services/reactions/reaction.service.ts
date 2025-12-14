import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { REACTION_SERVICE_NAME, ReactionServiceClient } from '@app/contracts/reaction';
import { SERVICES } from '@app/clients';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { GetLikesCountForVideo, GetDislikesCountForVideo, VideoReactedResponse } from './response';
import { ClientTransportLikeStatusEnumMapper } from './mappers/like-status';
import { VideoReactionDto } from './request';

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

  async getLikesCountForVideo(videoId: string): Promise<GetLikesCountForVideo> {
    this.logger.info(`Request recieved:${videoId}`);

    const response$ = this.reactionService.getLikesCountForVideo({
      videoId,
    });
    return await firstValueFrom(response$);
  }

  async getDislikesCountForVideo(videoId: string): Promise<GetDislikesCountForVideo> {
    this.logger.info(`Request recieved:${videoId}`);

    const response$ = this.reactionService.getDislikesCountForVideo({
      videoId,
    });
    return await firstValueFrom(response$);
  }
}
