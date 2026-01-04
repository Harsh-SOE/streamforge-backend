import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelCreatedIntegrationEvent } from '@app/common/events/channel';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { ChannelCreatedDomainEvent } from '@channel/domain/domain-events';

@EventsHandler(ChannelCreatedDomainEvent)
export class ChannelCreatedEventHandler implements IEventHandler<ChannelCreatedDomainEvent> {
  public constructor(
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: EventsPublisherPort,
  ) {}

  async handle(channelCreatedDomainEvent: ChannelCreatedDomainEvent) {
    const channelCreatedIntegrationEvent = new ChannelCreatedIntegrationEvent({
      eventId: channelCreatedDomainEvent.eventId,
      occurredAt: channelCreatedDomainEvent.occurredAt,
      payload: {
        channelId: channelCreatedDomainEvent.channelId,
        userId: channelCreatedDomainEvent.userId,
        isChannelMonitized: channelCreatedDomainEvent.isChannelMonitized,
        isChannelVerified: channelCreatedDomainEvent.isChannelVerified,
        coverImage: channelCreatedDomainEvent.coverImage,
        bio: channelCreatedDomainEvent.bio,
      },
    });

    await this.eventPublisher.publishMessage(channelCreatedIntegrationEvent);
  }
}
