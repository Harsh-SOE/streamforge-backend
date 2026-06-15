import { Inject } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';

import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { VideoVerifiedDomainEvent } from '@videos/domain/domain-events';
import { VideoUploadVerifiedIntegrationEvent } from '@app/contracts/events/videos';

export class VideoVerifiedHandler implements IEventHandler<VideoVerifiedDomainEvent> {
  public constructor(
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: EventsPublisherPort,
  ) {}

  async handle({ eventId, occurredAt, payload }: VideoVerifiedDomainEvent) {
    const { thumbnailFileIdentifier, videoFileIdentifier, videoId } = payload;

    const videoVerifiedIntegrationEvent = new VideoUploadVerifiedIntegrationEvent({
      eventId,
      occurredAt: occurredAt.toISOString(),
      payload: {
        thumbnailIdentifier: thumbnailFileIdentifier,
        videoId: videoId,
        videoIdentifier: videoFileIdentifier,
      },
    });

    await this.eventPublisher.publishMessage(videoVerifiedIntegrationEvent);
  }
}
