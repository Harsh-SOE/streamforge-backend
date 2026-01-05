import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PhoneNumberVerifiedIntegrationEvent } from '@app/common/events/users';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { PhoneNumberVerifiedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(PhoneNumberVerifiedDomainEvent)
export class PhoneNumberVerfiedHandler implements IEventHandler<PhoneNumberVerifiedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async handle(phoneNumberVerifiedDomainEvent: PhoneNumberVerifiedDomainEvent) {
    this.logger.info(
      `Phone number: ${phoneNumberVerifiedDomainEvent.phoneNumber} for verified for user with id:${phoneNumberVerifiedDomainEvent.userId}.`,
    );

    const phoneNumberVerifiedIntegrationEvent = new PhoneNumberVerifiedIntegrationEvent({
      eventId: phoneNumberVerifiedDomainEvent.eventId,
      occurredAt: phoneNumberVerifiedDomainEvent.occurredAt.toString(),
      payload: phoneNumberVerifiedDomainEvent,
    });

    await this.eventPublisher.publishMessage(phoneNumberVerifiedIntegrationEvent);
  }
}
