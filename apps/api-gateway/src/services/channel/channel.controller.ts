import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { User } from '@gateway/services/auth/decorators';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';

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
import { CHANNEL_API_VERSION, CHANNEL_API } from './api';

@Controller('channel')
@UseGuards(GatewayJwtGuard)
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(CHANNEL_API.UPLOAD_CHANNEL_COVER_IMAGE)
  @Version(CHANNEL_API_VERSION.V1)
  getPresignedUrl(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();
    return this.channelService.getPresignedUploadUrl(FileMetaDataDto, userId);
  }

  @Post(CHANNEL_API.CREATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.V1)
  createChannel(
    @Body() createChannelDto: CreateChannelRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<ChannelCreatedRequestResponse> {
    this.counter.inc();
    return this.channelService.createChannel(createChannelDto, user);
  }

  @Patch(CHANNEL_API.UPDATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.V1)
  updateChannel(
    @Body() channelUpdateDto: UpdateChannelRequestDto,
    @Param('id') channelId: string,
  ): Promise<UpdatedChannelRequestResponse> {
    this.counter.inc();
    return this.channelService.updateChannel(channelUpdateDto, channelId);
  }
}
