import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { SERVICES } from '@app/clients/constant';
import { UserAuthPayload } from '@app/contracts/auth';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { CHANNEL_SERVICE_NAME, ChannelServiceClient } from '@app/contracts/channel';

import {
  CreateChannelRequestDto,
  PreSignedUrlRequestDto,
  UpdateChannelRequestDto,
} from './request';
import {
  PreSignedUrlRequestResponse,
  ChannelCreatedRequestResponse,
  UpdatedChannelRequestResponse,
} from './response';

@Injectable()
export class ChannelService implements OnModuleInit {
  private channelService: ChannelServiceClient;

  constructor(
    @Inject(SERVICES.CHANNEL) private readonly channelClient: ClientGrpc,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  onModuleInit() {
    this.channelService = this.channelClient.getService(CHANNEL_SERVICE_NAME);
  }

  async getPresignedUploadUrl(
    preSignedUrlRequestDto: PreSignedUrlRequestDto,
    userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    const result$ = this.channelService.getPresignedUrlForFileUpload({
      ...preSignedUrlRequestDto,
      userId,
    });
    return await firstValueFrom(result$);
  }

  async createChannel(
    channel: CreateChannelRequestDto,
    user: UserAuthPayload,
  ): Promise<ChannelCreatedRequestResponse> {
    this.logger.info(`Request recieved:${JSON.stringify(channel)}`);
    const response$ = this.channelService.createChannel({
      userId: user.id,
      avatar: user.avatar,
      handle: user.handle,
      ...channel,
    });
    return await firstValueFrom(response$);
  }

  async updateChannel(
    updateChannelDto: UpdateChannelRequestDto,
    channelId: string,
  ): Promise<UpdatedChannelRequestResponse> {
    this.logger.info(`Request recieved:${JSON.stringify(updateChannelDto)}`);

    const response$ = this.channelService.channelUpdateById({
      id: channelId,
      ...updateChannelDto,
    });
    return await firstValueFrom(response$);
  }
}
