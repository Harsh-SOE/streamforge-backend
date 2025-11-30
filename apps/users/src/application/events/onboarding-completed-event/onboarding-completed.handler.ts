import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { OnBoardingCompletedEvent } from './onboarding-completed.event';

@EventsHandler(OnBoardingCompletedEvent)
export class OnBoardingCompletedEventHandler implements IEventHandler<OnBoardingCompletedEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({
    onBoardingCompletedEvent: phoneNumberVerfiedEventDto,
  }: OnBoardingCompletedEvent) {
    const { id } = phoneNumberVerfiedEventDto;
    this.logger.info(`User with id:${id} onboarded successfully`);
  }
}
