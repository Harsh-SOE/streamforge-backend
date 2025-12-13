import { ReactionDislikeCountVideoDto } from '@app/contracts/reaction';

export class GetDislikesVideoQuery {
  public constructor(public readonly reactionDislikeCountVideoDto: ReactionDislikeCountVideoDto) {}
}
