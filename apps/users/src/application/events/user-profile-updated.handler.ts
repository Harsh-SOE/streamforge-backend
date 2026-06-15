import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ProfileUpdatedIntegrationEvent } from '@app/contracts/events/users';
import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

import { ProfileUpdatedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(ProfileUpdatedDomainEvent)
export class UserProfileUpdatedIntegrationEventHandler implements IEventHandler<ProfileUpdatedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IntegrationEventsPublisherPort,
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
