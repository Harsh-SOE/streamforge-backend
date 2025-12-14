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
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

import { UserAuthPayload } from '@app/contracts/auth';

import { User } from '@gateway/common/decorators';
import { VIDEO_API_ENDPOINT, VIDEO_API_VERSION } from '@gateway/common/endpoints';
import { REQUESTS_COUNTER } from '@gateway/infrastructure/measure';
import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';

import {
  CreateVideoRequestDto,
  ListVideosQueryDto,
  PreSignedUrlRequestDto,
  UpdateVideoRequestDto,
} from './request';
import {
  PublishedVideoRequestResponse,
  FoundVideoRequestResponse,
  UpdatedVideoRequestResponse,
  PreSignedUrlRequestResponse,
} from './response';
import { VideoService } from './video.service';

@UseGuards(GatewayJwtGuard)
@Controller(VIDEO_API_ENDPOINT.ROOT)
export class VideoController {
  constructor(
    private videoService: VideoService,
    @InjectMetric(REQUESTS_COUNTER) private readonly counter: Counter,
  ) {}

  @Get(VIDEO_API_ENDPOINT.PRESIGNED_URL_FOR_VIDEO_FILE)
  @Version(VIDEO_API_VERSION.VERSION_1)
  getPresignedUrlForVideoFile(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();
    return this.videoService.getPresignedUploadVideoUrl(FileMetaDataDto, userId);
  }

  @Post(VIDEO_API_ENDPOINT.PRESIGNED_URL_FOR_VIDEO_THUMBNAIL)
  @Version(VIDEO_API_VERSION.VERSION_1)
  getPresignedUrlForVideoThumbnail(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    this.counter.inc();
    return this.videoService.getPresignedUploadThumbnailUrl(FileMetaDataDto, userId);
  }

  @Get(VIDEO_API_ENDPOINT.FIND_A_VIDEO)
  @Version(VIDEO_API_VERSION.VERSION_1)
  async findOneVideo(@Param('videoid') id: string): Promise<FoundVideoRequestResponse> {
    this.counter.inc();
    console.log(id);
    return this.videoService.findOneVideo(id);
  }

  @Post(VIDEO_API_ENDPOINT.PUBLISH_VIDEO)
  @Version(VIDEO_API_VERSION.VERSION_1)
  createVideo(
    @Body() createBookDto: CreateVideoRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<PublishedVideoRequestResponse> {
    this.counter.inc();
    return this.videoService.createVideo(createBookDto, user);
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
    this.counter.inc();
    return this.videoService.findVideos(listVideosQueryDto);
  }
}
