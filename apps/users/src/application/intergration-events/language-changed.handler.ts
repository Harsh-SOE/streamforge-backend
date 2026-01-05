import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { LanguageChangedIntergrationEvent } from '@app/common/events/users';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { LanguageChangedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(LanguageChangedDomainEvent)
export class LanguageChangedHandler implements IEventHandler<LanguageChangedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: EventsPublisherPort,
  ) {}

  public async handle(languageChangedDomainEvent: LanguageChangedDomainEvent) {
    this.logger.info(
      `User with id:${languageChangedDomainEvent.userId} changed its language to '${languageChangedDomainEvent.language}'`,
    );

    const userLanguageChangedIntegrationEvent = new LanguageChangedIntergrationEvent({
      eventId: languageChangedDomainEvent.eventId,
      occurredAt: languageChangedDomainEvent.occurredAt.toString(),
      payload: languageChangedDomainEvent,
    });

    await this.publisher.publishMessage(userLanguageChangedIntegrationEvent);
  }
}
