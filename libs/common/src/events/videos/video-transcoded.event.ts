import { IntegrationEvent, VIDEO_TRANSCODER_EVENTS } from '@app/common/events';

export interface VideoTranscodedIntegrationEventPayload {
  videoId: string;
  newIdentifier: string;
}

export class VideoTranscodedIntegrationEvent implements IntegrationEvent<VideoTranscodedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = VIDEO_TRANSCODER_EVENTS.VIDEO_TRANSCODED_EVENT;
  public readonly payload: VideoTranscodedIntegrationEventPayload;

  public constructor(
    public readonly config: {
      eventId: string;
      occurredAt: string;
      payload: VideoTranscodedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { videoId, newIdentifier },
    } = config;

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      videoId,
      newIdentifier,
    };
  }
}
