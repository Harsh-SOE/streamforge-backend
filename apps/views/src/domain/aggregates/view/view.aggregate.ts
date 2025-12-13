import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { ViewEntity } from '@views/domain/entities';
import { UserId, VideoId } from '@views/domain/value-objects';

export class ViewAggregate extends AggregateRoot {
  public constructor(private viewEntity: ViewEntity) {
    super();
  }

  public static create(userId: string, videoId: string) {
    const view = new ViewEntity(uuidv4(), UserId.create(userId), VideoId.create(videoId));
    const viewAggregate = new ViewAggregate(view);
    return viewAggregate;
  }

  public getEntity() {
    return this.viewEntity;
  }

  public getSnapshot() {
    return this.viewEntity.getSnapshot();
  }
}
