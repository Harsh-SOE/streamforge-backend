import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { VideoCreatedDomainEvent } from '@videos/domain/domain-events';

@EventsHandler(VideoCreatedDomainEvent)
export class VideoPublishedEventHandler implements IEventHandler<VideoCreatedDomainEvent> {
  constructor(@Inject(EVENT_PUBLISHER_PORT) private eventConsumer: EventsPublisherPort) {}

  public async handle(videoCreatedDomainEvent: VideoCreatedDomainEvent) {
    const {
      videoId,
      userId,
      channelId,
      title,
      description,
      fileIdentifier,
      thumbnailIdentifier,
      categories,
      visibility,
    } = videoCreatedDomainEvent.payload;

    const videoPublishedIntegrationEvent = new VideoPublishedIntegrationEvent({
      eventId: videoCreatedDomainEvent.eventId,
      occurredAt: videoCreatedDomainEvent.occurredAt.toISOString(),
      payload: {
        videoId,
        userId,
        channelId,
        title,
        description,
        fileIdentifier,
        thumbnailIdentifier,
        categories,
        visibility,
      },
    });

    await this.eventConsumer.publishMessage(videoPublishedIntegrationEvent);
  }
}
