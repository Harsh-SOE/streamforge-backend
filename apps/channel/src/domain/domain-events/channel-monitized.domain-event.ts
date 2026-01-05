import { DomainEvent } from '@app/common/events';

export class ChannelMonitizedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  public constructor(
    public readonly channelId: string,
    public readonly isChannelMonitized: boolean,
  ) {}
}
