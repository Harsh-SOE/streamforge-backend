import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  CheckUploadedVideoDto,
  CheckUploadedVideoResponse,
  VideoDraftSavedResponse,
  VideoSaveDraftDto,
  VideoServiceController,
  VideoServiceControllerMethods,
  VideoUpdatedResponse,
  VideoUpdateDto,
} from '@app/contracts/protocols/videos';

import { RpcService } from './rpc.service';
import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@VideoServiceControllerMethods()
@Controller()
export class RpcController implements VideoServiceController {
  constructor(private readonly videoService: RpcService) {}

  saveDraft(
    videoSaveDraftDto: VideoSaveDraftDto,
  ):
    | Promise<VideoDraftSavedResponse>
    | Observable<VideoDraftSavedResponse>
    | VideoDraftSavedResponse {
    return this.videoService.saveDraft(videoSaveDraftDto);
  }

  checkUploadedVideo(
    checkUploadedVideoDto: CheckUploadedVideoDto,
  ):
    | Promise<CheckUploadedVideoResponse>
    | Observable<CheckUploadedVideoResponse>
    | CheckUploadedVideoResponse {
    return this.videoService.verifyUploadedVideo(checkUploadedVideoDto);
  }

  update(
    videoUpdateDto: VideoUpdateDto,
  ): Promise<VideoUpdatedResponse> | Observable<VideoUpdatedResponse> | VideoUpdatedResponse {
    return this.videoService.update(videoUpdateDto);
  }
}
