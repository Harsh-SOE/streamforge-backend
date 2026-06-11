import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  CheckUploadedVideoDto,
  SaveVideoDraftDto,
  UpdateVideoDto,
  VideoDraftSavedResponse,
  VideoServiceController,
  VideoServiceControllerMethods,
  VideoUpdatedResponse,
  VideoUploadedVerifiedResponse,
} from '@app/contracts/protocols/videos';

import { GrpcFilter } from '../filters';
import { RpcService } from './rpc.service';

@UseFilters(GrpcFilter)
@VideoServiceControllerMethods()
@Controller()
export class RpcController implements VideoServiceController {
  constructor(private readonly videoService: RpcService) {}

  saveDraft(
    videoSaveDraftDto: SaveVideoDraftDto,
  ):
    | Promise<VideoDraftSavedResponse>
    | Observable<VideoDraftSavedResponse>
    | VideoDraftSavedResponse {
    return this.videoService.saveDraft(videoSaveDraftDto);
  }

  checkUploadedVideo(
    checkUploadedVideoDto: CheckUploadedVideoDto,
  ):
    | Promise<VideoUploadedVerifiedResponse>
    | Observable<VideoUploadedVerifiedResponse>
    | VideoUploadedVerifiedResponse {
    return this.videoService.verifyUploadedVideo(checkUploadedVideoDto);
  }

  update(
    videoUpdateDto: UpdateVideoDto,
  ): Promise<VideoUpdatedResponse> | Observable<VideoUpdatedResponse> | VideoUpdatedResponse {
    return this.videoService.update(videoUpdateDto);
  }
}
