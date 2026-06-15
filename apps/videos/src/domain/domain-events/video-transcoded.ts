import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/contracts/events/base';

export class VideoTranscodedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly payload: {
      videoId: string;
      userId: string;
      channelId: string;
      hlsManifestIdentifier: string;
      durationSeconds: number;
      width?: number;
      height?: number;
      sizeBytes?: bigint;
      mimeType?: string;
    },
  ) {}
}
