import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { EventsPublisherPort, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { NotificationStatusChangedIntegrationEvent } from '@app/common/events/users';

import { NotificationStatusChangedDomainEvent } from '@users/domain/domain-events';

@EventsHandler(NotificationStatusChangedDomainEvent)
export class NotificationStatusChangedHandler implements IEventHandler<NotificationStatusChangedDomainEvent> {
  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async handle(notificationStatusChangedDomainEvent: NotificationStatusChangedDomainEvent) {
    this.logger.info(
      `User with id:${notificationStatusChangedDomainEvent.userId} turned ${notificationStatusChangedDomainEvent.status ? 'on' : 'off'} its notification status`,
    );

    const userLanguageChangedIntegrationEvent = new NotificationStatusChangedIntegrationEvent({
      eventId: notificationStatusChangedDomainEvent.eventId,
      occurredAt: notificationStatusChangedDomainEvent.occurredAt.toString(),
      payload: notificationStatusChangedDomainEvent,
    });

    await this.eventPublisher.publishMessage(userLanguageChangedIntegrationEvent);
  }
}
