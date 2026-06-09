import { CHANNEL_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface ChannelMonitizedIntegrationEventPayload {
  channelId: string;
  isChannelMonitized: boolean;
}

export class ChannelMonitizedIntegrationEvent implements IntegrationEvent<ChannelMonitizedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
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

    this.id = eventId;
    this.name = TOPICS.CHANNEL;
    this.producer = 'channel-service';
    this.cause = CHANNEL_EVENT_CAUSES.CHANNEL_MONITIZED;
    this.publishedAt = occurredAt;
    this.payload = {
      channelId,
      isChannelMonitized,
    };
  }
}
