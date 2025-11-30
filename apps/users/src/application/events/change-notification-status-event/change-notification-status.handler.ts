import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { ChangeNotificationStatusEvent } from './change-notification-status.event';

@EventsHandler(ChangeNotificationStatusEvent)
export class ChangeNotificationStatusEventHandler implements IEventHandler<ChangeNotificationStatusEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({
    notificationStatusChangedEventDto,
  }: ChangeNotificationStatusEvent) {
    const { id, status } = notificationStatusChangedEventDto;
    this.logger.info(
      `User with id:${id} turned ${status ? 'on' : 'off'} its notification status`,
    );
  }
}
