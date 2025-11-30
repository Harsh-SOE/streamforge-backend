import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { ChangeLanguageEvent } from './change-language.event';

@EventsHandler(ChangeLanguageEvent)
export class ChangeLanguageEventHandler implements IEventHandler<ChangeLanguageEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({ langaugeChangedEventDto }: ChangeLanguageEvent) {
    const { id, langauge } = langaugeChangedEventDto;

    this.logger.info(
      `User with id:${id} changed its language to '${langauge}'`,
    );
  }
}
