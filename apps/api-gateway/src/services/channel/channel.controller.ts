import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Body, Controller, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';

import { UserAuthPayload } from '@app/common/dtos';

import { User } from '@gateway/common/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { CHANNEL_API_ENDPOINT, CHANNEL_API_VERSION } from '@gateway/common/endpoints';

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

@Controller(CHANNEL_API_ENDPOINT.ROOT)
@UseGuards(GatewayJwtGuard)
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(CHANNEL_API_ENDPOINT.UPLOAD_CHANNEL_COVER_IMAGE)
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
