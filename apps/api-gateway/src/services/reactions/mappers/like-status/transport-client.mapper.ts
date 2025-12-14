import { ReactionType } from '@app/contracts/reaction';

import { ReactionRequestStatus } from '../../enums';

const TransportClientLikeStatusEnumMapper: Record<ReactionType, ReactionRequestStatus> = {
  [ReactionType.REACTION_LIKE]: ReactionRequestStatus.LIKE,
  [ReactionType.REACTION_UNLIKE]: ReactionRequestStatus.UNLIKE,
  [ReactionType.REACTION_DISLIKE]: ReactionRequestStatus.DISLIKE,
  [ReactionType.REACTION_UNDISLIKE]: ReactionRequestStatus.UNDISKLIKE,
  [ReactionType.UNRECOGNIZED]: ReactionRequestStatus.LIKE,
};

export { TransportClientLikeStatusEnumMapper };
