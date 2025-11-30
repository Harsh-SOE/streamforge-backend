import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { firstValueFrom } from 'rxjs';

import {
  REACTION_SERVICE_NAME,
  ReactionServiceClient,
} from '@app/contracts/reaction';
import { SERVICES } from '@app/clients';

import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { LOGGER_PORT, LoggerPort } from '@gateway/application/ports';

import {
  GetLikesCountForVideo,
  GetDislikesCountForVideo,
  VideoReactedResponse,
} from './response';
import { ClientGrpcLikeStatusEnumMapper } from './mappers';
import { VideoReactionDto } from './request';

@Injectable()
export class ReactionService implements OnModuleInit {
  private reactionService: ReactionServiceClient;

  constructor(
    @Inject(SERVICES.REACTION) private reactionClient: ClientGrpc,
    @InjectMetric(REQUESTS_COUNTER) private counter: Counter,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.reactionService = this.reactionClient.getService(
      REACTION_SERVICE_NAME,
    );
  }

  async reactToVideo(
    userId: string,
    videoId: string,
    videoLikeStatusCreatedDto: VideoReactionDto,
  ): Promise<VideoReactedResponse> {
    this.counter.inc();

    this.logger.info(`Request recieved:${userId}`);

    const reactionStatusForService = ClientGrpcLikeStatusEnumMapper.get(
      videoLikeStatusCreatedDto.reactionStatus,
    );

    // TODO: Rectify the undefined case...
    if (reactionStatusForService === undefined) {
      throw new Error(`Invalid reaction status`);
    }

    const response$ = this.reactionService.reactToVideo({
      userId,
      videoId,
      reaction: reactionStatusForService,
    });
    return await firstValueFrom(response$);
  }

  async getLikesCountForVideo(videoId: string): Promise<GetLikesCountForVideo> {
    this.counter.inc();

    this.logger.info(`Request recieved:${videoId}`);

    const response$ = this.reactionService.getLikesCountForVideo({
      videoId,
    });
    return await firstValueFrom(response$);
  }

  async getDislikesCountForVideo(
    videoId: string,
  ): Promise<GetDislikesCountForVideo> {
    this.counter.inc();

    this.logger.info(`Request recieved:${videoId}`);

    const response$ = this.reactionService.getDislikesCountForVideo({
      videoId,
    });
    return await firstValueFrom(response$);
  }
}
