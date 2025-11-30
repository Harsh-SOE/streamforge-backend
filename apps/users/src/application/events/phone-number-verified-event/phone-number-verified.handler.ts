import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { PhoneNumberVerfiedEvent } from './phone-number-verified.event';

@EventsHandler(PhoneNumberVerfiedEvent)
export class PhoneNumberVerfiedEventHandler implements IEventHandler<PhoneNumberVerfiedEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({ phoneNumberVerfiedEventDto }: PhoneNumberVerfiedEvent) {
    const { id, phoneNumber } = phoneNumberVerfiedEventDto;
    this.logger.info(
      `Phone number: ${phoneNumber} for verified for user with id:${id}.`,
    );
  }
}
