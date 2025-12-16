import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  VideoCreateDto,
  VideoPublishedResponse,
  VideoServiceController,
  VideoServiceControllerMethods,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/videos';

import { RpcService } from './rpc.service';
import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@VideoServiceControllerMethods()
@Controller()
export class RpcController implements VideoServiceController {
  constructor(private readonly videoService: RpcService) {}

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

  update(videoUpdateDto: VideoUpdateDto): Promise<VideoUpdatedResponse> {
    return this.videoService.update(videoUpdateDto);
  }

  remove(id: string) {
    return this.videoService.remove(id);
  }
}
