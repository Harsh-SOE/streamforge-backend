import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { LanguageChangedIntergrationEvent } from '@app/common/events/users';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { LanguageChangedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(LanguageChangedDomainEvent)
export class LanguageChangedIntegrationEventHandler implements IEventHandler<LanguageChangedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: EventsPublisherPort,
  ) {}

  public async handle(languageChangedDomainEvent: LanguageChangedDomainEvent) {
    const payload = languageChangedDomainEvent.payload;

    this.logger.info(
      `User with id:${payload.userId} changed its language to '${payload.language}'`,
    );

    const userLanguageChangedIntegrationEvent = new LanguageChangedIntergrationEvent({
      eventId: languageChangedDomainEvent.eventId,
      occurredAt: languageChangedDomainEvent.occurredAt.toString(),
      payload,
    });

    await this.publisher.publishMessage(userLanguageChangedIntegrationEvent);
  }
}
