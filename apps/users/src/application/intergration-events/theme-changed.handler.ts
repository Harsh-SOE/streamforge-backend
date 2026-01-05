import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ThemeChangedIntegrationEvent } from '@app/common/events/users';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { ThemeChangedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(ThemeChangedDomainEvent)
export class ThemeChangedHandler implements IEventHandler<ThemeChangedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async handle(themeChangedDomainEvent: ThemeChangedDomainEvent) {
    this.logger.info(
      `User with id:${themeChangedDomainEvent.userId} chaanged its theme to ${themeChangedDomainEvent.theme}`,
    );

    const themeChangedIntegrationEvent = new ThemeChangedIntegrationEvent({
      eventId: themeChangedDomainEvent.eventId,
      occurredAt: themeChangedDomainEvent.occurredAt.toString(),
      payload: themeChangedDomainEvent,
    });

    await this.eventPublisher.publishMessage(themeChangedIntegrationEvent);
  }
}
