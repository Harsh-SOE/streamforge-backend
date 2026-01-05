import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ProfileUpdatedIntegrationEvent } from '@app/common/events/users';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { ProfileUpdatedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(ProfileUpdatedDomainEvent)
export class UserProfileUpdatedHandler implements IEventHandler<ProfileUpdatedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async handle(profileUpdatedDomainEvent: ProfileUpdatedDomainEvent) {
    this.logger.info(
      `User with id:${profileUpdatedDomainEvent.userId}, updated its profile to: ${JSON.stringify(profileUpdatedDomainEvent)}`,
    );

    const profileUpdatedIntegrationEvent = new ProfileUpdatedIntegrationEvent({
      eventId: profileUpdatedDomainEvent.eventId,
      occurredAt: profileUpdatedDomainEvent.occurredAt,
      payload: profileUpdatedDomainEvent,
    });

    await this.eventPublisher.publishMessage(profileUpdatedIntegrationEvent);
  }
}
