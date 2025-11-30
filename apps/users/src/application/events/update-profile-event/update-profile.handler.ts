import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { UpdateProfileEvent } from './update-profile.event';

@EventsHandler(UpdateProfileEvent)
export class UpdateProfileEventHandler implements IEventHandler<UpdateProfileEvent> {
  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public handle({ userUpdateProfileDto }: UpdateProfileEvent) {
    const { updatedProfile } = userUpdateProfileDto;
    const { id } = updatedProfile;
    this.logger.info(
      `User with id:${id}, updated its profile to: ${JSON.stringify(updatedProfile)}`,
    );
  }
}
