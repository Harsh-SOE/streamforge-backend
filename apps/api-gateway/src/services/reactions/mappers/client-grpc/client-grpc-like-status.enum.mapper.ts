import { ReactionType } from '@app/contracts/reaction';

import { ReactionRequestStatus } from '../../enums';

const ClientGrpcLikeStatusEnumMapper = new Map<
  ReactionRequestStatus,
  ReactionType
>();

ClientGrpcLikeStatusEnumMapper.set(
  ReactionRequestStatus.LIKE,
  ReactionType.REACTION_LIKE,
);
ClientGrpcLikeStatusEnumMapper.set(
  ReactionRequestStatus.UNLIKE,
  ReactionType.REACTION_UNLIKE,
);
ClientGrpcLikeStatusEnumMapper.set(
  ReactionRequestStatus.DISLIKE,
  ReactionType.REACTION_DISLIKE,
);
ClientGrpcLikeStatusEnumMapper.set(
  ReactionRequestStatus.UNDISKLIKE,
  ReactionType.REACTION_UNDISLIKE,
);

export { ClientGrpcLikeStatusEnumMapper };
