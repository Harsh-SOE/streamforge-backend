import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { OnboardedIntegrationEvent } from '@app/common/events/users';

@Injectable()
export class EventsService {
  public constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  public async OnUserOnboardedEvent(event: OnboardedIntegrationEvent) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    this.logger.info(`Recieved user onboarded event`, event);
  }
}
