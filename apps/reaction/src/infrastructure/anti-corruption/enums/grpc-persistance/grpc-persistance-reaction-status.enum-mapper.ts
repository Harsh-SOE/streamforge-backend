import { ReactionType } from '@app/contracts/reaction';

import { ReactionPersistanceStatus } from '@peristance/reaction';

const GrpcPersistanceReactionStatusEnumMapper = new Map<ReactionType, ReactionPersistanceStatus>();

GrpcPersistanceReactionStatusEnumMapper.set(
  ReactionType.REACTION_LIKE,
  ReactionPersistanceStatus.LIKED,
);

GrpcPersistanceReactionStatusEnumMapper.set(
  ReactionType.REACTION_UNLIKE,
  ReactionPersistanceStatus.UNLIKED,
);

GrpcPersistanceReactionStatusEnumMapper.set(
  ReactionType.REACTION_DISLIKE,
  ReactionPersistanceStatus.DISLIKED,
);

GrpcPersistanceReactionStatusEnumMapper.set(
  ReactionType.REACTION_UNDISLIKE,
  ReactionPersistanceStatus.UNDISLIKED,
);

export { GrpcPersistanceReactionStatusEnumMapper };
