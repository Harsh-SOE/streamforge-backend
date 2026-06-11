import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { VideoDraftCreatedDomainEvent } from '@videos/domain/domain-events';

@EventsHandler(VideoDraftCreatedDomainEvent)
export class VideoPublishedEventHandler implements IEventHandler<VideoDraftCreatedDomainEvent> {
  constructor(@Inject(EVENT_PUBLISHER_PORT) private eventConsumer: EventsPublisherPort) {}

  public async handle(videoDraftCreatedDomainEvent: VideoDraftCreatedDomainEvent) {
    const {
      videoId,
      ownerId: userId,
      channelId,
      title,
      description,
      categories,
      visibility,
    } = videoDraftCreatedDomainEvent.payload;

    const videoPublishedIntegrationEvent = new VideoDraftSavedIntegrationEvent({
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

    await this.eventConsumer.publishMessage(videoPublishedIntegrationEvent);
  }
}
