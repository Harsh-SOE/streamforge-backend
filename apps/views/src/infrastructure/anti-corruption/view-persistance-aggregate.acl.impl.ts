import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { ViewAggregate } from '@views/domain/aggregates';

import { View } from '@persistance/views';

@Injectable()
export class ViewPeristanceAggregateACL implements IAggregatePersistanceACL<
  ViewAggregate,
  Omit<View, 'watchedAt'>
> {
  public toAggregate(persistance: Omit<View, 'watchedAt'>): ViewAggregate {
    return ViewAggregate.create({ userId: persistance.userId, videoId: persistance.videoId });
  }

  public toPersistance(entity: ViewAggregate): Omit<View, 'watchedAt'> {
    return {
      id: entity.getSnapshot().id,
      userId: entity.getSnapshot().userId,
      videoId: entity.getSnapshot().videoId,
    };
  }
}
