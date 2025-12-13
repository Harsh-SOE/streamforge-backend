import { Controller, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  ViewsVideoDto,
  ViewsVideoResponse,
  ViewsServiceController,
  ViewsServiceControllerMethods,
} from '@app/contracts/views';

import { GrpcService } from './grpc.service';
import { GrpcFilter } from '../filters';

@Controller()
@UseFilters(GrpcFilter)
@ViewsServiceControllerMethods()
export class GrpcController implements ViewsServiceController {
  public constructor(private readonly watchService: GrpcService) {}

  viewVideo(
    watchVideoDto: ViewsVideoDto,
  ): Promise<ViewsVideoResponse> | Observable<ViewsVideoResponse> | ViewsVideoResponse {
    return this.watchService.watchVideo(watchVideoDto);
  }
}
