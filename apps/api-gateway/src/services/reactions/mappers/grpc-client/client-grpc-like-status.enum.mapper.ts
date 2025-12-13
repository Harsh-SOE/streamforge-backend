import { ReactionType } from '@app/contracts/reaction';

import { ReactionRequestStatus } from '../../enums';

const GrpcClientLikeStatusEnumMapper = new Map<ReactionType, ReactionRequestStatus>();

GrpcClientLikeStatusEnumMapper.set(ReactionType.REACTION_LIKE, ReactionRequestStatus.LIKE);
GrpcClientLikeStatusEnumMapper.set(ReactionType.REACTION_UNLIKE, ReactionRequestStatus.UNLIKE);
GrpcClientLikeStatusEnumMapper.set(ReactionType.REACTION_DISLIKE, ReactionRequestStatus.DISLIKE);
GrpcClientLikeStatusEnumMapper.set(
  ReactionType.REACTION_UNDISLIKE,
  ReactionRequestStatus.UNDISKLIKE,
);

export { GrpcClientLikeStatusEnumMapper };
