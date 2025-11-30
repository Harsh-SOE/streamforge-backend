import { DatabaseFilter } from '@app/common/types';

import { ReactionAggregate } from '@reaction/domain/aggregates';
import { ReactionDomainStatus } from '@reaction/domain/enums';

import { VideoReactions } from '@peristance/reaction';

export interface ReactionRepositoryPort {
  save(model: ReactionAggregate): Promise<ReactionAggregate>;

  saveMany(models: ReactionAggregate[]): Promise<number>;

  update(
    filter: DatabaseFilter<VideoReactions>,
    newLikeStatus: ReactionDomainStatus,
  ): Promise<ReactionAggregate>;

  updateMany(
    filter: DatabaseFilter<VideoReactions>,
    newLikeStatus: ReactionDomainStatus,
  ): Promise<number>;
}

export const REACTION_DATABASE_PORT = Symbol('REACTION_DATABASE_PORT');
