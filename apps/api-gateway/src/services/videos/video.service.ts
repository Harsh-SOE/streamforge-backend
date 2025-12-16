import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { VIDEO_SERVICE_NAME, VideoServiceClient } from '@app/contracts/videos';
import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';
import { CHANNEL_SERVICE_NAME, ChannelServiceClient } from '@app/contracts/channel';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { QUERY_SERVICE_NAME, QueryServiceClient } from '@app/contracts/query';

import { ClientTransportVideoVisibilityEnumMapper } from './mappers/video-visibility-status';
import { ClientTransportVideoPublishEnumMapper } from './mappers/video-publish-status';
import { CreateVideoRequestDto, PreSignedUrlRequestDto, UpdateVideoRequestDto } from './request';
import {
  PreSignedUrlRequestResponse,
  PublishedVideoRequestResponse,
  UpdatedVideoRequestResponse,
} from './response';

@Injectable()
export class VideoService implements OnModuleInit {
  private videoService: VideoServiceClient;
  private channelService: ChannelServiceClient;
  private queryService: QueryServiceClient;

  constructor(
    @Inject(SERVICES.VIDEO) private readonly videoClient: ClientGrpc,
    @Inject(SERVICES.CHANNEL) private readonly channelClient: ClientGrpc,
    @Inject(SERVICES.QUERY) private readonly queryClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.videoService = this.videoClient.getService(VIDEO_SERVICE_NAME);
    this.channelService = this.channelClient.getService(CHANNEL_SERVICE_NAME);
    this.queryService = this.queryClient.getService(QUERY_SERVICE_NAME);
  }

  async getPresignedUploadVideoUrl(
    preSignedUrlRequestDto: PreSignedUrlRequestDto,
    userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    const result$ = this.videoService.getPresignedUrlForVideoFileUpload({
      ...preSignedUrlRequestDto,
      userId,
    });

    const result = await firstValueFrom(result$);
    return result;
  }

  async getPresignedUploadThumbnailUrl(
    preSignedUrlRequestDto: PreSignedUrlRequestDto,
    userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    const result$ = this.videoService.getPresignedUrlForThumbnailFileUpload({
      ...preSignedUrlRequestDto,
      userId,
    });

    const result = await firstValueFrom(result$);
    return result;
  }

  async createVideo(
    video: CreateVideoRequestDto,
    user: UserAuthPayload,
  ): Promise<PublishedVideoRequestResponse> {
    // const channel$ = this.queryService.({
    //   userId: user.id,
    // });

    // const channel = await firstValueFrom(channel$);
    // if (!channel || !channel.channel) {
    //   this.logger.info(`No channel was found`);
    //   throw new Error(`Channel not found`);
    // }

    const videoServiceVisibilityStatus = ClientTransportVideoVisibilityEnumMapper[video.visibility];

    const videoServicePublishStatus = ClientTransportVideoPublishEnumMapper[video.status];

    const response$ = this.videoService.save({
      ownerId: user.id,
      channelId: '',
      videoTransportPublishStatus: videoServicePublishStatus,
      videoTransportVisibilityStatus: videoServiceVisibilityStatus,
      ...video,
    });
    return await firstValueFrom(response$);
  }

  async updateOneVideo(
    updateVideoDto: UpdateVideoRequestDto,
    videoId: string,
  ): Promise<UpdatedVideoRequestResponse> {
    const response$ = this.videoService.update({
      id: videoId,
      categories: updateVideoDto.categories || [],
      ...updateVideoDto,
    });
    return await firstValueFrom(response$);
  }
}
