import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { User } from '@gateway/proxies/auth/decorators';

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
  constructor(private channelService: ChannelService) {}

  @Post(CHANNEL_API.UPLOAD_CHANNEL_COVER_IMAGE)
  @Version(CHANNEL_API_VERSION.V1)
  getPresignedUrl(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    return this.channelService.getPresignedUploadUrl(FileMetaDataDto, userId);
  }

  @Post(CHANNEL_API.CREATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.V1)
  createChannel(
    @Body() createChannelDto: CreateChannelRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<ChannelCreatedRequestResponse> {
    return this.channelService.createChannel(createChannelDto, user);
  }

  @Patch(CHANNEL_API.UPDATE_CHANNEL)
  @Version(CHANNEL_API_VERSION.V1)
  updateChannel(
    @Body() channelUpdateDto: UpdateChannelRequestDto,
    @Param('id') channelId: string,
  ): Promise<UpdatedChannelRequestResponse> {
    return this.channelService.updateChannel(channelUpdateDto, channelId);
  }
}
