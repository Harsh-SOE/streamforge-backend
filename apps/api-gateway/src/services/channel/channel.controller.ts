import { Body, Controller, Get, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { User } from '@gateway/common/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';

import {
  CreateChannelRequestDto,
  PreSignedUrlRequestDto,
  UpdateChannelRequestDto,
} from './request';
import {
  ChannelCreatedRequestResponse,
  UpdatedChannelRequestResponse,
  PreSignedUrlRequestResponse,
} from './response';
import { ChannelService } from './channel.service';
import { CHANNEL_API_ENDPOINT, CHANNEL_API_VERSION } from '@gateway/common/endpoints';

@Controller(CHANNEL_API_ENDPOINT.ROOT)
@UseGuards(GatewayJwtGuard)
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Get(CHANNEL_API_ENDPOINT.UPLOAD_CHANNEL_COVER_IMAGE)
  @Version(CHANNEL_API_VERSION.VERSION_1)
  getPresignedUrl(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();
    return this.channelService.getPresignedUploadUrl(FileMetaDataDto, userId);
  }

  @Post(CHANNEL_API_ENDPOINT.CREATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.VERSION_1)
  createChannel(
    @Body() createChannelDto: CreateChannelRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<ChannelCreatedRequestResponse> {
    this.counter.inc();
    return this.channelService.createChannel(createChannelDto, user);
  }

  @Patch(CHANNEL_API_ENDPOINT.UPDATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.VERSION_1)
  updateChannel(
    @Body() channelUpdateDto: UpdateChannelRequestDto,
    @Param('id') channelId: string,
  ): Promise<UpdatedChannelRequestResponse> {
    this.counter.inc();
    return this.channelService.updateChannel(channelUpdateDto, channelId);
  }
}
