import { VIDEO_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface VideoProcessedIntegrationEventPayload {
  videoId: string;
  hlsManifestKey: string;
  durationSeconds: number;
  sizeBytes: bigint;
  height: number;
  width: number;
  mimeType: string;
}

export class VideoProcessedIntegrationEvent implements IntegrationEvent<VideoProcessedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: VideoProcessedIntegrationEventPayload;

  public constructor(
    public readonly config: {
      eventId: string;
      occurredAt: string;
      payload: VideoProcessedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: {
        videoId,
        hlsManifestKey: hlsManifestIdentifier,
        durationSeconds,
        height,
        mimeType,
        sizeBytes,
        width,
      },
    } = config;

    this.id = eventId;
    this.name = TOPICS.VIDEOS;
    this.producer = 'video-service';
    this.cause = VIDEO_EVENT_CAUSES.VIDEO_PROCESSED;
    this.publishedAt = occurredAt;
    this.payload = {
      videoId,
      hlsManifestKey: hlsManifestIdentifier,
      durationSeconds,
      height,
      mimeType,
      sizeBytes,
      width,
    };
  }
}
