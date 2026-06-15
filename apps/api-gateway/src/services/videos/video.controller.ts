/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
  NotImplementedException,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/common/dtos';

import { User } from '@gateway/common/decorators';
import { VIDEO_API_ENDPOINT, VIDEO_API_VERSION } from '@gateway/common/endpoints';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';

import { SaveVideoDraftRequestDto, ListVideosQueryDto, UpdateVideoRequestDto } from './request';
import {
  VideoDraftSavedRequestResponse,
  FoundVideoRequestResponse,
  UpdatedVideoRequestResponse,
} from './response';
import { VideoService } from './video.service';
import { VideoUploadVerifiedRequestResponse } from './response/video-upload-verified-request.response';

@UseGuards(GatewayJwtGuard)
@Controller(VIDEO_API_ENDPOINT.ROOT)
export class VideoController {
  constructor(
    private videoService: VideoService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Post(VIDEO_API_ENDPOINT.DRAFT)
  @Version(VIDEO_API_VERSION.VERSION_1)
  createVideoDraft(
    @Body() createVideoDraftRequestDto: SaveVideoDraftRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<VideoDraftSavedRequestResponse> {
    this.counter.inc();
    return this.videoService.createVideoDraft(createVideoDraftRequestDto, user);
  }

  @Get(VIDEO_API_ENDPOINT.VERIFY_UPLOAD)
  @Version(VIDEO_API_VERSION.VERSION_1)
  verifyVideoUpload(@Param('videoid') id: string): Promise<VideoUploadVerifiedRequestResponse> {
    return this.videoService.verifyVideoUpload(id);
  }

  @Get(VIDEO_API_ENDPOINT.FIND_A_VIDEO)
  @Version(VIDEO_API_VERSION.VERSION_1)
  findOneVideo(@Param('videoid') id: string): Promise<FoundVideoRequestResponse> {
    throw new NotImplementedException(`Implement 'findOneVideo' method first`);
  }

  @Patch(VIDEO_API_ENDPOINT.UPDATE_A_VIDEO)
  @Version(VIDEO_API_VERSION.VERSION_1)
  updateVideo(
    @Body() videoUpdateDto: UpdateVideoRequestDto,
    @Param('videoid') videoId: string,
  ): Promise<UpdatedVideoRequestResponse> {
    this.counter.inc();
    return this.videoService.updateOneVideo(videoUpdateDto, videoId);
  }

  @Get()
  findVideos(@Query() listVideosQueryDto: ListVideosQueryDto) {
    throw new NotImplementedException(`Implement 'findVideos' method first`);
  }
}
