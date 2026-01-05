import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ReactionResponse } from '@app/contracts/reaction';

import {
  REACTION_CACHE_PORT,
  ReactionCachePort,
  REACTION_BUFFER_PORT,
  ReactionBufferPort,
} from '@reaction/application/ports';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { TransportDomainReactionStatusEnumMapper } from '@reaction/infrastructure/anti-corruption';

import { DislikeCommand } from './dislike.command';

@CommandHandler(DislikeCommand)
export class DislikeCommandHandler implements ICommandHandler<DislikeCommand, ReactionResponse> {
  public constructor(
    @Inject(REACTION_CACHE_PORT)
    private readonly cacheAdapter: ReactionCachePort,
    @Inject(REACTION_BUFFER_PORT)
    private readonly bufferAdapter: ReactionBufferPort,
  ) {}

  public async execute({ videoDislikeDto }: DislikeCommand): Promise<ReactionResponse> {
    const { userId, videoId, reaction } = videoDislikeDto;

    const likeDomainStatus = TransportDomainReactionStatusEnumMapper[reaction];

    const reactionAggregate = ReactionAggregate.create({
      userId,
      videoId,
      reactionStatus: likeDomainStatus,
    });

    const res = await this.cacheAdapter.recordDislike(videoId, userId);

    if (res !== 1) {
      return { response: `video was already disliked by the user` };
    }

    await this.bufferAdapter.bufferReaction(reactionAggregate);

    return { response: `video was disliked successfully` };
  }
}
