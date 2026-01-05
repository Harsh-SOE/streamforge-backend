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

import { UnlikeCommand } from './unlike.command';

@CommandHandler(UnlikeCommand)
export class UnlikeCommandHandler implements ICommandHandler<UnlikeCommand, ReactionResponse> {
  public constructor(
    @Inject(REACTION_CACHE_PORT)
    private readonly cacheAdapter: ReactionCachePort,
    @Inject(REACTION_BUFFER_PORT)
    private readonly bufferAdapter: ReactionBufferPort,
  ) {}

  public async execute({ videoUnlikeDto }: UnlikeCommand): Promise<ReactionResponse> {
    const { userId, videoId, reaction } = videoUnlikeDto;

    const likeDomainStatus = TransportDomainReactionStatusEnumMapper[reaction];

    const reactionAggregate = ReactionAggregate.create({
      userId,
      videoId,
      reactionStatus: likeDomainStatus,
    });

    const res = await this.cacheAdapter.removeLike(videoId, userId);

    if (res !== 1) {
      return {
        response: `video was not liked by the user in the first place, so unlike cannot be performed`,
      };
    }

    await this.bufferAdapter.bufferReaction(reactionAggregate);

    return { response: `video was unliked successfully` };
  }
}
