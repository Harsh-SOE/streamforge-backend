import { CHANNEL_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface ChannelCreatedIntegrationEventPayload {
  channelId: string;
  userId: string;
  isChannelMonitized: boolean;
  isChannelVerified: boolean;
  coverImage?: string;
  bio?: string;
}

export class ChannelCreatedIntegrationEvent implements IntegrationEvent<ChannelCreatedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: ChannelCreatedIntegrationEventPayload;

  public constructor(
    public readonly channelCreatedDomainEvent: {
      eventId: string;
      occurredAt: Date;
      payload: ChannelCreatedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { channelId, userId, bio, coverImage, isChannelMonitized, isChannelVerified },
    } = channelCreatedDomainEvent;
    this.id = eventId;
    this.name = TOPICS.CHANNEL;
    this.producer = 'channel-service';
    this.cause = CHANNEL_EVENT_CAUSES.CHANNEL_CREATED;
    this.publishedAt = occurredAt.toISOString();
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
