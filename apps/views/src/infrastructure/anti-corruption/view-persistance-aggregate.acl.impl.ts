import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { ViewEntity } from '@views/domain/entities';
import { ViewAggregate } from '@views/domain/aggregates';
import { UserId, VideoId } from '@views/domain/value-objects';

import { View } from '@persistance/views';

@Injectable()
export class ViewPeristanceAggregateACL implements IAggregatePersistanceACL<
  ViewAggregate,
  Omit<View, 'watchedAt'>
> {
  public toAggregate(persistance: Omit<View, 'watchedAt'>): ViewAggregate {
    const viewEntity = new ViewEntity(
      persistance.id,
      new UserId(persistance.userId),
      new VideoId(persistance.videoId),
    );
    return new ViewAggregate(viewEntity);
  }

  public toPersistance(entity: ViewAggregate): Omit<View, 'watchedAt'> {
    return {
      id: entity.getSnapshot().id,
      userId: entity.getSnapshot().userId,
      videoId: entity.getSnapshot().videoId,
    };
  }
}
