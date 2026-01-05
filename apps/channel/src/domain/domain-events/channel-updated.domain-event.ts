import { DomainEvent } from '@app/common/events';

export class ChannelUpdatedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  public constructor(
    public readonly channelId: string,
    public readonly userId: string,
    public readonly isChannelMonitized: boolean,
    public readonly isChannelVerified: boolean,
    public readonly bio?: string,
    public readonly coverImage?: string,
  ) {}
}
