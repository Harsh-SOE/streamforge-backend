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

import { UnDislikeCommand } from './undislike.command';

@CommandHandler(UnDislikeCommand)
export class UnDislikeCommandHandler implements ICommandHandler<
  UnDislikeCommand,
  ReactionResponse
> {
  public constructor(
    @Inject(REACTION_CACHE_PORT)
    private readonly cacheAdapter: ReactionCachePort,
    @Inject(REACTION_BUFFER_PORT)
    private readonly bufferAdapter: ReactionBufferPort,
  ) {}

  public async execute({ videoUndisikeDto }: UnDislikeCommand): Promise<ReactionResponse> {
    const { userId, videoId, reaction } = videoUndisikeDto;

    const likeDomainStatus = TransportDomainReactionStatusEnumMapper[reaction];

    const reactionAggregate = ReactionAggregate.create({
      userId,
      videoId,
      reactionStatus: likeDomainStatus,
    });

    const res = await this.cacheAdapter.removeDislike(videoId, userId);

    if (res !== 1) {
      return { response: `video was already liked by the current user` };
    }

    await this.bufferAdapter.bufferReaction(reactionAggregate);

    return { response: `video was undisliked successfully` };
  }
}
