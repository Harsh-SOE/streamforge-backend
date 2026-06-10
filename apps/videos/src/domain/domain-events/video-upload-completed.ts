import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/contracts/events/base';

export class VideoUploadCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly payload: {
      videoId: string;
      userId: string;
      channelId: string;
      fileIdentifier: string;
      thumbnailIdentifier: string;
    },
  ) {}
}
