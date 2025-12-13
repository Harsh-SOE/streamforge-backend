import { ReactionType } from '@app/contracts/reaction';

import { ReactionDomainStatus } from '@reaction/domain/enums';

const GrpcDomainReactionStatusEnumMapper = new Map<ReactionType, ReactionDomainStatus>();

GrpcDomainReactionStatusEnumMapper.set(ReactionType.REACTION_LIKE, ReactionDomainStatus.LIKED);

GrpcDomainReactionStatusEnumMapper.set(ReactionType.REACTION_UNLIKE, ReactionDomainStatus.UNLIKED);

GrpcDomainReactionStatusEnumMapper.set(
  ReactionType.REACTION_DISLIKE,
  ReactionDomainStatus.DISLIKED,
);

GrpcDomainReactionStatusEnumMapper.set(
  ReactionType.REACTION_UNDISLIKE,
  ReactionDomainStatus.UNDISLIKED,
);

export { GrpcDomainReactionStatusEnumMapper };
