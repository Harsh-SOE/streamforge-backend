import { ReactionType } from '@app/contracts/reaction';

import { ReactionRequestStatus } from '../../enums';

const ClientTransportLikeStatusEnumMapper: Record<ReactionRequestStatus, ReactionType> = {
  [ReactionRequestStatus.LIKE]: ReactionType.REACTION_LIKE,
  [ReactionRequestStatus.UNLIKE]: ReactionType.REACTION_UNLIKE,
  [ReactionRequestStatus.DISLIKE]: ReactionType.REACTION_DISLIKE,
  [ReactionRequestStatus.UNDISKLIKE]: ReactionType.REACTION_UNDISLIKE,
};

export { ClientTransportLikeStatusEnumMapper };
