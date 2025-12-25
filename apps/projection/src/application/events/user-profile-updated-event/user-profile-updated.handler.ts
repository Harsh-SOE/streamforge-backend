import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  UserProjectionRepositoryPort,
  USER_PROJECTION_REPOSITORY_PORT,
} from '@projection/application/ports';

import { UserProfileUpdatedProjectionEvent } from './user-profile-updated.event';

@EventsHandler(UserProfileUpdatedProjectionEvent)
export class UserProfileUpdatedProjectionHandler implements IEventHandler<UserProfileUpdatedProjectionEvent> {
  constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRespository: UserProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async handle({ userProfileUpdatedEventDto }: UserProfileUpdatedProjectionEvent) {
    this.logger.info(`updating user projection`);
    await this.userProjectionRespository.updateUser(
      userProfileUpdatedEventDto.id,
      userProfileUpdatedEventDto,
    );
  }
}
