import { ReactionLikeCountVideoDto } from '@app/contracts/reaction';

export class GetLikesVideoQuery {
  public constructor(public readonly reactionLikeCountVideoDto: ReactionLikeCountVideoDto) {}
}
