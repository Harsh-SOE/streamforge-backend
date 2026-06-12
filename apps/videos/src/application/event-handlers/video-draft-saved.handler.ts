import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { VideoDraftSavedDomainEvent } from '@videos/domain/domain-events';

@EventsHandler(VideoDraftSavedDomainEvent)
export class VideoDraftSavedEventHandler implements IEventHandler<VideoDraftSavedDomainEvent> {
  constructor(@Inject(EVENT_PUBLISHER_PORT) private eventPublisher: EventsPublisherPort) {}

  public async handle(videoDraftCreatedDomainEvent: VideoDraftSavedDomainEvent) {
    const {
      videoId,
      ownerId: userId,
      channelId,
      title,
      description,
      categories,
      visibility,
    } = videoDraftCreatedDomainEvent.payload;

    const videoDraftSavedIntegrationEvent = new VideoDraftSavedIntegrationEvent({
      eventId: videoDraftCreatedDomainEvent.eventId,
      occurredAt: videoDraftCreatedDomainEvent.occurredAt.toISOString(),
      payload: {
        videoId,
        userId,
        channelId,
        title,
        description,
        categories,
        visibility,
      },
    });

    await this.eventPublisher.publishMessage(videoDraftSavedIntegrationEvent);
  }
}
