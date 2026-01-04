import { CHANNEL_EVENTS, IntegrationEvent } from '@app/common/events';

export interface ChannelMonitizedIntegrationEventPayload {
  channelId: string;
  isChannelMonitized: boolean;
}

export class ChannelMonitizedIntegrationEvent implements IntegrationEvent<ChannelMonitizedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = CHANNEL_EVENTS.CHANNEL_MONITIZED;
  public readonly payload: ChannelMonitizedIntegrationEventPayload;

  public constructor(
    public readonly channelMonitizedDomainEvent: {
      eventId: string;
      occurredAt: string;
      payload: ChannelMonitizedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { channelId, isChannelMonitized },
    } = channelMonitizedDomainEvent;

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      channelId,
      isChannelMonitized,
    };
  }
}
