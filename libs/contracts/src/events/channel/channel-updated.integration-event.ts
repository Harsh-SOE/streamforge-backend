import { CHANNEL_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface ChannelUpdatedIntegrationEventPayload {
  channelId: string;
  userId: string;
  isChannelMonitized: boolean;
  isChannelVerified: boolean;
  bio?: string;
  coverImage?: string;
}

export class ChannelUpdatedIntegrationEvent implements IntegrationEvent<ChannelUpdatedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: ChannelUpdatedIntegrationEventPayload;

  public constructor(
    public readonly channelUpdatedDomainEvent: {
      eventId: string;
      occurredAt: string;
      payload: ChannelUpdatedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { channelId, isChannelMonitized, isChannelVerified, userId, bio, coverImage },
    } = channelUpdatedDomainEvent;

    this.id = eventId;
    this.name = TOPICS.CHANNEL;
    this.producer = 'channel-service';
    this.cause = CHANNEL_EVENT_CAUSES.CHANNEL_UPDATED;
    this.publishedAt = occurredAt;
    this.payload = {
      channelId,
      userId,
      bio,
      coverImage,
      isChannelMonitized,
      isChannelVerified,
    };
  }
}
