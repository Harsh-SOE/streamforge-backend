import { IntegrationEvent, VIDEO_EVENTS } from '@app/common/events';

export interface VideoPublishedIntegrationEventPayload {
  videoId: string;
  userId: string;
  channelId: string;
  title: string;
  visibility: string;
  description?: string;
  fileIdentifier: string;
  categories: Array<string>;
  thumbnailIdentifier: string;
}

export class VideoPublishedIntegrationEvent implements IntegrationEvent<VideoPublishedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = VIDEO_EVENTS.VIDEO_PUBLISHED_EVENT;
  public readonly payload: VideoPublishedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: VideoPublishedIntegrationEventPayload;
  }) {
    const { eventId, occurredAt, payload } = config;

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = payload;
  }
}
