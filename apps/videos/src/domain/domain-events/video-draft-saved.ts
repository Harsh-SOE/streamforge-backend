import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/contracts/events/base';

export class VideoDraftCreatedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly payload: {
      videoId: string;
      ownerId: string;
      channelId: string;
      title: string;
      categories: Array<string>;
      state: string;
      visibility: string;
      description?: string;
    },
  ) {}
}
