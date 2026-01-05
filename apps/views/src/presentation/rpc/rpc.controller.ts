import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  ViewsVideoDto,
  ViewsVideoResponse,
  ViewsServiceController,
  ViewsServiceControllerMethods,
} from '@app/contracts/views';

import { RpcService } from './rpc.service';
import { GrpcFilter } from '../filters';

@Controller()
@UseFilters(GrpcFilter)
@ViewsServiceControllerMethods()
export class RpcController implements ViewsServiceController {
  public constructor(private readonly watchService: RpcService) {}

  viewVideo(
    watchVideoDto: ViewsVideoDto,
  ): Promise<ViewsVideoResponse> | Observable<ViewsVideoResponse> | ViewsVideoResponse {
    return this.watchService.watchVideo(watchVideoDto);
  }
}
