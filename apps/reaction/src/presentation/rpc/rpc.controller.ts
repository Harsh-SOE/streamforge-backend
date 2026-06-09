import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  ReactionServiceController,
  ReactionServiceControllerMethods,
  ReactionResponse,
  VideoReactionDto,
} from '@app/contracts/protocols/reaction';

import { RpcService } from './rpc.service';

import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@ReactionServiceControllerMethods()
@Controller()
export class RpcController implements ReactionServiceController {
  constructor(private readonly grpcService: RpcService) {}

  reactToVideo(
    videoReactionDto: VideoReactionDto,
  ): Promise<ReactionResponse> | Observable<ReactionResponse> | ReactionResponse {
    return this.grpcService.reactToVideo(videoReactionDto);
  }
}
