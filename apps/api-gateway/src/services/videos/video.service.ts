import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { VIDEO_SERVICE_NAME, VideoServiceClient } from '@app/contracts/videos';
import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';
import { CHANNEL_SERVICE_NAME, ChannelServiceClient } from '@app/contracts/channel';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  ClientTransportVideoVisibilityEnumMapper,
  TransportClientVideoVisibilityEnumMapper,
} from './mappers/video-visibility-status';
import {
  ClientTransportVideoPublishEnumMapper,
  TransportClientVideoPublishEnumMapper,
} from './mappers/video-publish-status';
import {
  CreateVideoRequestDto,
  ListVideosQueryDto,
  PreSignedUrlRequestDto,
  UpdateVideoRequestDto,
} from './request';
import {
  FoundVideoRequestResponse,
  PreSignedUrlRequestResponse,
  PublishedVideoRequestResponse,
  UpdatedVideoRequestResponse,
} from './response';

@Injectable()
export class VideoService implements OnModuleInit {
  private videoService: VideoServiceClient;
  private channelService: ChannelServiceClient;

  constructor(
    @Inject(SERVICES.VIDEO) private readonly videoClient: ClientGrpc,
    @Inject(SERVICES.CHANNEL) private readonly channelClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.videoService = this.videoClient.getService(VIDEO_SERVICE_NAME);
    this.channelService = this.channelClient.getService(CHANNEL_SERVICE_NAME);
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
    const channel$ = this.channelService.findChannelByUserId({
      userId: user.id,
    });

    const channel = await firstValueFrom(channel$);
    if (!channel || !channel.channel) {
      this.logger.info(`No channel was found`);
      throw new Error(`Channel not found`);
    }

    const videoServiceVisibilityStatus = ClientTransportVideoVisibilityEnumMapper[video.visibility];

    const videoServicePublishStatus = ClientTransportVideoPublishEnumMapper[video.status];

    const response$ = this.videoService.save({
      ownerId: user.id,
      channelId: channel.channel.id,
      videoTransportPublishStatus: videoServicePublishStatus,
      videoTransportVisibilityStatus: videoServiceVisibilityStatus,
      ...video,
    });
    return await firstValueFrom(response$);
  }

  async findOneVideo(id: string): Promise<FoundVideoRequestResponse> {
    const response$ = this.videoService.findOne({ id });
    const response = await firstValueFrom(response$);
    const videoPublishStatusResponse =
      TransportClientVideoPublishEnumMapper[response.videoTransportPublishStatus];
    const videoVisibilityStatusResponse =
      TransportClientVideoVisibilityEnumMapper[response.videoTransportVisibilityStatus];

    return {
      id: response.id,
      title: response.title,
      thumbnail: response.videoThumbnailIdentifier,
      categories: response.categories,
      videoFileIdentifier: response.videoFileIdentifier,
      videoPublishStatus: videoPublishStatusResponse,
      videoVisibilityStatus: videoVisibilityStatusResponse,
      description: response.description,
    };
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

  findVideos(listVideosQueryDto: ListVideosQueryDto) {
    return this.videoService.findVideos({
      limit: listVideosQueryDto.limit,
      skip: listVideosQueryDto.cursor,
      channelId: listVideosQueryDto.channelId,
      categories: listVideosQueryDto.categories || [],
    });
  }
}
