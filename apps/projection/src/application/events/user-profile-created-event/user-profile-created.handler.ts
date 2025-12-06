import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  UserProjectionRepositoryPort,
  USER_PROJECTION_REPOSITORY_PORT,
} from '@projection/application/ports';

import { UserProfileCreatedProjectionEvent } from './user-profile-created.event';

@EventsHandler(UserProfileCreatedProjectionEvent)
export class UserProfileCreatedProjectionHandler implements IEventHandler<UserProfileCreatedProjectionEvent> {
  constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userCardRespository: UserProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async handle({
    userProfileCreatedEventDto,
  }: UserProfileCreatedProjectionEvent) {
    this.logger.info(`saving user projection`);
    await this.userCardRespository.saveUser(userProfileCreatedEventDto);
  }
}
