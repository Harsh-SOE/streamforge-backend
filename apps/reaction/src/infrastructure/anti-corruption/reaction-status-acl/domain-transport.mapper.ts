import { ReactionType } from '@app/contracts/protocols/reaction';

import { ReactionDomainStatus } from '@reaction/domain/enums';

const DomainTransportReactionStatusEnumMapper: Record<ReactionDomainStatus, ReactionType> = {
  [ReactionDomainStatus.LIKED]: ReactionType.REACTION_LIKE,
  [ReactionDomainStatus.UNLIKED]: ReactionType.REACTION_UNLIKE,
  [ReactionDomainStatus.DISLIKED]: ReactionType.REACTION_DISLIKE,
  [ReactionDomainStatus.UNDISLIKED]: ReactionType.REACTION_UNDISLIKE,
};

export { DomainTransportReactionStatusEnumMapper };
