import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { UserOnboardedIntegrationEvent } from '@app/contracts/events/users';
import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

import { OnboardedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(OnboardedDomainEvent)
export class UserOnboardedIntegrationEventHandler implements IEventHandler<OnboardedDomainEvent> {
  constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IntegrationEventsPublisherPort,
  ) {}

  async handle(onboardedDomainEvent: OnboardedDomainEvent) {
    const payload = onboardedDomainEvent.payload;

    this.logger.info(
      `User with email:${payload.email}, created a profile: ${JSON.stringify(onboardedDomainEvent)}`,
    );

    const onboardedIntegrationEvent = new UserOnboardedIntegrationEvent({
      eventId: onboardedDomainEvent.eventId,
      occurredAt: onboardedDomainEvent.occurredAt.toISOString(),
      payload,
    });
    await this.eventPublisher.publishMessage(onboardedIntegrationEvent);
  }
}
