import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ReactionLikeCountVideoResponse } from '@app/contracts/reaction';

import {
  REACTION_CACHE_PORT,
  ReactionCachePort,
} from '@reaction/application/ports';

import { GetLikesVideoQuery } from './get-likes-video.queries';

@QueryHandler(GetLikesVideoQuery)
export class GetLikesVideoQueryHandler implements IQueryHandler<
  GetLikesVideoQuery,
  ReactionLikeCountVideoResponse
> {
  public constructor(
    @Inject(REACTION_CACHE_PORT)
    private readonly cacheAdapter: ReactionCachePort,
  ) {}

  public async execute({
    reactionLikeCountVideoDto,
  }: GetLikesVideoQuery): Promise<ReactionLikeCountVideoResponse> {
    const { videoId } = reactionLikeCountVideoDto;

    const totalLikes = await this.cacheAdapter.getTotalLikes(videoId);

    return { likes: totalLikes };
  }
}
