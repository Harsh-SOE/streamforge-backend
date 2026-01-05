import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class VideoTranscodedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly videoId: string,
    public readonly newIdentifier: string,
  ) {}
}
