import { Inject } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';

import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

import { VideoUploadVerifiedDomainEvent } from '@videos/domain/domain-events';
import { VideoUploadVerifiedIntegrationEvent } from '@app/contracts/events/videos';

export class VideoUploadVerifiedHandler implements IEventHandler<VideoUploadVerifiedDomainEvent> {
  public constructor(
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IntegrationEventsPublisherPort,
  ) {}

  async handle({ eventId, occurredAt, payload }: VideoUploadVerifiedDomainEvent) {
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
