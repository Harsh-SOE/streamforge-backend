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

import { UserAuthPayload } from '@app/contracts/auth';

import { GatewayJwtGuard } from '@gateway/infrastructure/jwt/guard';
import { User } from '@gateway/proxies/auth/decorators';

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
import { VIDEO_API, VIDEO_API_VERSION } from './api';

@Controller('videos')
@UseGuards(GatewayJwtGuard)
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post(VIDEO_API.PRESIGNED_URL_FOR_VIDEO_FILE)
  @Version(VIDEO_API_VERSION.V1)
  getPresignedUrlForVideoFile(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    return this.videoService.getPresignedUploadVideoUrl(
      FileMetaDataDto,
      userId,
    );
  }

  @Post(VIDEO_API.PRESIGNED_URL_FOR_VIDEO_THUMBNAIL)
  @Version(VIDEO_API_VERSION.V1)
  getPresignedUrlForVideoThumbnail(
    @Body() FileMetaDataDto: PreSignedUrlRequestDto,
    @User('id') userId: string,
  ): Promise<PreSignedUrlRequestResponse> {
    return this.videoService.getPresignedUploadThumbnailUrl(
      FileMetaDataDto,
      userId,
    );
  }

  @Get(VIDEO_API.FIND_A_VIDEO)
  @Version(VIDEO_API_VERSION.V1)
  async findOneVideo(
    @Param('id') id: string,
  ): Promise<FoundVideoRequestResponse> {
    console.log(id);
    return this.videoService.findOneVideo(id);
  }

  @Post(VIDEO_API.PUBLISH_VIDEO)
  @Version(VIDEO_API_VERSION.V1)
  createVideo(
    @Body() createBookDto: CreateVideoRequestDto,
    @User() user: UserAuthPayload,
  ): Promise<PublishedVideoRequestResponse> {
    return this.videoService.createVideo(createBookDto, user);
  }

  @Patch(VIDEO_API.UPDATE_A_VIDEO)
  @Version(VIDEO_API_VERSION.V1)
  updateVideo(
    @Body() videoUpdateDto: UpdateVideoRequestDto,
    @Param('id') videoId: string,
  ): Promise<UpdatedVideoRequestResponse> {
    return this.videoService.updateOneVideo(videoUpdateDto, videoId);
  }

  @Get()
  findVideos(@Query() listVideosQueryDto: ListVideosQueryDto) {
    return this.videoService.findVideos(listVideosQueryDto);
  }
}
