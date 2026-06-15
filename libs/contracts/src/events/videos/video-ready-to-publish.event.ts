import { VIDEO_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface VideoReadyToPublishIntegrationEventPayload {
  videoId: string;
  videoIdentifier: string;
  thumbnailIdentifier: string;
}

export class VideoReadyToPublishIntegrationEvent implements IntegrationEvent<VideoReadyToPublishIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: VideoReadyToPublishIntegrationEventPayload;

  public constructor(
    public readonly config: {
      eventId: string;
      occurredAt: string;
      payload: VideoReadyToPublishIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { videoId, thumbnailIdentifier, videoIdentifier },
    } = config;

    this.id = eventId;
    this.name = TOPICS.VIDEOS;
    this.producer = 'video-service';
    this.cause = VIDEO_EVENT_CAUSES.VIDEO_UPLOAD_VERIFIED;
    this.publishedAt = occurredAt;
    this.payload = {
      videoId,
      thumbnailIdentifier,
      videoIdentifier,
    };
  }
}
