import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { ChangeThemeEvent } from './change-theme.event';

@EventsHandler(ChangeThemeEvent)
export class ChangeThemeEventHandler implements IEventHandler<ChangeThemeEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({ changeThemeEventDto }: ChangeThemeEvent) {
    const { id, theme } = changeThemeEventDto;

    this.logger.info(`User with id:${id} chaanged its theme to ${theme}`);
  }
}
