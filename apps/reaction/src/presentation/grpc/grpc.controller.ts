import { Controller, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  ReactionServiceController,
  ReactionServiceControllerMethods,
  ReactionHealthCheckRequest,
  ReactionHealthCheckResponse,
  ReactionResponse,
  VideoReactionDto,
  ReactionFoundForVideoResponse,
  ReactionDislikeCountVideoDto,
  ReactionDislikeCountVideoResponse,
  ReactionLikeCountVideoDto,
  ReactionLikeCountVideoResponse,
  ReactedOnVideoDto,
} from '@app/contracts/reaction';

import { GrpcService } from './grpc.service';

import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@ReactionServiceControllerMethods()
@Controller()
export class GrpcController implements ReactionServiceController {
  constructor(private readonly grpcService: GrpcService) {}

  // TODO: Remove it
  check(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reactionHealthCheckRequest: ReactionHealthCheckRequest,
  ):
    | Promise<ReactionHealthCheckResponse>
    | Observable<ReactionHealthCheckResponse>
    | ReactionHealthCheckResponse {
    return { status: 1 }; // 1 = SERVING
  }

  reactToVideo(
    videoReactionDto: VideoReactionDto,
  ):
    | Promise<ReactionResponse>
    | Observable<ReactionResponse>
    | ReactionResponse {
    return this.grpcService.reactToVideo(videoReactionDto);
  }

  getLikesCountForVideo(
    reactionLikeCountVideoDto: ReactionLikeCountVideoDto,
  ):
    | Promise<ReactionLikeCountVideoResponse>
    | Observable<ReactionLikeCountVideoResponse>
    | ReactionLikeCountVideoResponse {
    return this.grpcService.getLikesCountForVideo(reactionLikeCountVideoDto);
  }

  getDislikesCountForVideo(
    reactionDislikeCountVideoDto: ReactionDislikeCountVideoDto,
  ):
    | Promise<ReactionDislikeCountVideoResponse>
    | Observable<ReactionDislikeCountVideoResponse>
    | ReactionDislikeCountVideoResponse {
    return this.grpcService.getDislikesCountForVideo(
      reactionDislikeCountVideoDto,
    );
  }

  findReactionOfUserOnVideo(
    reactedOnVideoDto: ReactedOnVideoDto,
  ):
    | Promise<ReactionFoundForVideoResponse>
    | Observable<ReactionFoundForVideoResponse>
    | ReactionFoundForVideoResponse {
    return this.grpcService.findReactionOfUserOnVideo(reactedOnVideoDto);
  }
}
