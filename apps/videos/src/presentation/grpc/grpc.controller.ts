import { Controller, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  VideoCreateDto,
  VideoFindDto,
  VideoFindQueryDto,
  VideoFoundResponse,
  VideoPublishedResponse,
  VideoServiceController,
  VideoServiceControllerMethods,
  VideosFoundResponse,
  VideosHealthCheckRequest,
  VideosHealthCheckResponse,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/videos';

import { GrpcService } from './grpc.service';
import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@VideoServiceControllerMethods()
@Controller()
export class GrpcController implements VideoServiceController {
  constructor(private readonly videoService: GrpcService) {}

  check(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: VideosHealthCheckRequest,
  ):
    | Promise<VideosHealthCheckResponse>
    | Observable<VideosHealthCheckResponse>
    | VideosHealthCheckResponse {
    return { status: 1 }; // 1 = SERVING
  }

  getPresignedUrlForVideoFileUpload(
    getPresignedUrlDto: GetPresignedUrlDto,
  ):
    | Promise<GetPreSignedUrlResponse>
    | Observable<GetPreSignedUrlResponse>
    | GetPreSignedUrlResponse {
    return this.videoService.generatePreSignedVideoUrl(getPresignedUrlDto);
  }

  getPresignedUrlForThumbnailFileUpload(
    getPresignedUrlDto: GetPresignedUrlDto,
  ):
    | Promise<GetPreSignedUrlResponse>
    | Observable<GetPreSignedUrlResponse>
    | GetPreSignedUrlResponse {
    return this.videoService.generatePreSignedVideoUrl(getPresignedUrlDto);
  }

  save(
    videoCreateDto: VideoCreateDto,
  ): Promise<VideoPublishedResponse> | Observable<VideoPublishedResponse> | VideoPublishedResponse {
    return this.videoService.create(videoCreateDto);
  }

  findAll(): Promise<VideosFoundResponse> {
    return this.videoService.findAll();
  }

  findOne(videoFindDto: VideoFindDto): Promise<VideoFoundResponse> {
    return this.videoService.findOne(videoFindDto);
  }

  findVideos(
    videoFindQueryDto: VideoFindQueryDto,
  ): Promise<VideosFoundResponse> | Observable<VideosFoundResponse> | VideosFoundResponse {
    return this.videoService.findVideos(videoFindQueryDto);
  }

  update(videoUpdateDto: VideoUpdateDto): Promise<VideoUpdatedResponse> {
    return this.videoService.update(videoUpdateDto);
  }

  remove(id: string) {
    return this.videoService.remove(id);
  }
}
