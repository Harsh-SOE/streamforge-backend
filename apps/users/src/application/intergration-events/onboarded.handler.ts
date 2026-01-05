import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { OnboardedIntegrationEvent } from '@app/common/events/users/onboarded';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { OnboardedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(OnboardedDomainEvent)
export class UserProfileHandler implements IEventHandler<OnboardedDomainEvent> {
  constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventsPublisherPort,
  ) {}

  async handle(onboardedDomainEvent: OnboardedDomainEvent) {
    this.logger.info(
      `User with email:${onboardedDomainEvent.email}, created a profile: ${JSON.stringify(onboardedDomainEvent)}`,
    );

    const onboardedIntegrationEvent = new OnboardedIntegrationEvent({
      eventId: onboardedDomainEvent.eventId,
      occuredAt: onboardedDomainEvent.occurredAt.toISOString(),
      payload: {
        userId: onboardedDomainEvent.userId,
        authId: onboardedDomainEvent.authId,
        email: onboardedDomainEvent.email,
        handle: onboardedDomainEvent.handle,
      },
    });

    await this.eventPublisher.publishMessage(onboardedIntegrationEvent);
  }
}
