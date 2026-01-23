import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { UserProjectionEvent } from '@app/common/events/projections';
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
    const payload = onboardedDomainEvent.payload;

    this.logger.info(
      `User with email:${payload.email}, created a profile: ${JSON.stringify(onboardedDomainEvent)}`,
    );

    const onboardedIntegrationEvent = new OnboardedIntegrationEvent({
      eventId: onboardedDomainEvent.eventId,
      occuredAt: onboardedDomainEvent.occurredAt.toISOString(),
      payload,
    });

    const onboardedProjectionEvent = new UserProjectionEvent(payload);

    await this.eventPublisher.publishMessage(onboardedIntegrationEvent);
    await this.eventPublisher.publishMessage(onboardedProjectionEvent);
  }
}
