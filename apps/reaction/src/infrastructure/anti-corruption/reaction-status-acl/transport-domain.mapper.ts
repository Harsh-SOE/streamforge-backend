import { ReactionType } from '@app/contracts/protocols/reaction';

import { ReactionDomainStatus } from '@reaction/domain/enums';

const TransportDomainReactionStatusEnumMapper: Record<ReactionType, ReactionDomainStatus> = {
  [ReactionType.REACTION_LIKE]: ReactionDomainStatus.LIKED,
  [ReactionType.REACTION_UNLIKE]: ReactionDomainStatus.UNLIKED,
  [ReactionType.REACTION_DISLIKE]: ReactionDomainStatus.DISLIKED,
  [ReactionType.REACTION_UNDISLIKE]: ReactionDomainStatus.UNDISLIKED,
  [ReactionType.UNRECOGNIZED]: ReactionDomainStatus.UNLIKED,
};

export { TransportDomainReactionStatusEnumMapper };
