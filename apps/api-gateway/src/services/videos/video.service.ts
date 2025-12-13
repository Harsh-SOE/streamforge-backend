import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { VIDEO_SERVICE_NAME, VideoServiceClient } from '@app/contracts/videos';
import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';
import { CHANNEL_SERVICE_NAME, ChannelServiceClient } from '@app/contracts/channel';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

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
import {
  ClientTransportVideoPublishEnumMapper,
  ClientTransportVideoVisibilityEnumMapper,
  TransportClientVideoPublishEnumMapper,
  TransportClientVideoVisibilityEnumMapper,
} from './mappers';

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
    this.logger.info(`Gateway result is: `, result);
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
    this.logger.info(`Gateway result is: `, result);
    return result;
  }

  async createVideo(
    video: CreateVideoRequestDto,
    user: UserAuthPayload,
  ): Promise<PublishedVideoRequestResponse> {
    this.logger.info(`Request recieved:${JSON.stringify(video)}`);

    // check if a channel exists with given userId or not...
    const channel$ = this.channelService.findChannelByUserId({
      userId: user.id,
    });

    const channel = await firstValueFrom(channel$);
    this.logger.info(`Channel is`, channel);
    if (!channel || !channel.channel) {
      this.logger.info(`No channel was found`);
      throw new Error(`Channel not found`);
    }

    const videoServiceVisibilityStatus = ClientTransportVideoVisibilityEnumMapper.get(
      video.visibility,
    );

    const videoServicePublishStatus = ClientTransportVideoPublishEnumMapper.get(video.status);

    console.log(videoServicePublishStatus);
    console.log(videoServiceVisibilityStatus);

    if (videoServiceVisibilityStatus === undefined || videoServicePublishStatus === undefined) {
      throw new Error(`Invalid Video visibility or publish status`);
    }
    const response$ = this.videoService.save({
      ownerId: user.id,
      channelId: channel.channel.id,
      videoTransportPublishStatus: videoServicePublishStatus,
      videoTransportVisibilityStatus: videoServiceVisibilityStatus,
      ...video,
    });
    return await firstValueFrom(response$);
  }

  // TODO: Fix this type mismatch
  async findOneVideo(id: string): Promise<FoundVideoRequestResponse> {
    this.logger.info(`Request recieved:${id}`);

    const response$ = this.videoService.findOne({ id });
    const response = await firstValueFrom(response$);
    const videoPublishStatusResponse = TransportClientVideoPublishEnumMapper.get(
      response.videoTransportPublishStatus,
    );
    const videoVisibilityStatusResponse = TransportClientVideoVisibilityEnumMapper.get(
      response.videoTransportVisibilityStatus,
    );

    if (!videoPublishStatusResponse || !videoVisibilityStatusResponse) {
      throw new Error(`Invalid Response from service: ${JSON.stringify(response)}`);
    }
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
    this.logger.info(`Request recieved:${JSON.stringify(updateVideoDto)}`);

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
