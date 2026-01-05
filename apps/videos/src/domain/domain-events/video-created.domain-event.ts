import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class VideoCreatedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly payload: {
      videoId: string;
      userId: string;
      channelId: string;
      title: string;
      fileIdentifier: string;
      thumbnailIdentifier: string;
      categories: Array<string>;
      visibility: string;
      description?: string;
    },
  ) {}
}
