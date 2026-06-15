import { VIDEO_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface VideoDraftSavedEventPayload {
  videoId: string;
  userId: string;
  channelId: string;
  title: string;
  visibility: string;
  description?: string;
  categories: Array<string>;
}

export class VideoDraftSavedIntegrationEvent implements IntegrationEvent<VideoDraftSavedEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: VideoDraftSavedEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: VideoDraftSavedEventPayload;
  }) {
    const { eventId, occurredAt, payload } = config;

    this.id = eventId;
    this.name = TOPICS.VIDEOS;
    this.producer = 'video-service';
    this.cause = VIDEO_EVENT_CAUSES.VIDEO_PUBLISHED;
    this.publishedAt = occurredAt;
    this.payload = payload;
  }
}
