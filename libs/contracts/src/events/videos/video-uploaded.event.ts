import { VIDEO_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface VideoUploadedIntegrationEventPayload {
  videoId: string;
  newIdentifier: string;
}

export class VideoUploadedIntegrationEvent implements IntegrationEvent<VideoUploadedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: VideoUploadedIntegrationEventPayload;

  public constructor(
    public readonly config: {
      eventId: string;
      occurredAt: string;
      payload: VideoUploadedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { videoId, newIdentifier },
    } = config;

    this.id = eventId;
    this.name = TOPICS.VIDEOS;
    this.producer = 'video-service';
    this.cause = VIDEO_EVENT_CAUSES.VIDEO_UPLOADED;
    this.publishedAt = occurredAt;
    this.payload = {
      videoId,
      newIdentifier,
    };
  }
}
