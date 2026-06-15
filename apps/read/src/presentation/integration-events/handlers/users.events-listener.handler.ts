import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { UserOnboardedIntegrationEvent } from '@app/contracts/events/users';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  UserProjectionRepositoryPort,
} from '@read/application/ports';

@Injectable()
export class UsersIntergrationEventsHandler {
  public constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRespository: UserProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onUserProfileOnBoarded(userProfileCreatedEventDto: UserOnboardedIntegrationEvent) {
    this.logger.info(`saving user projection`);
    await this.userProjectionRespository.saveUser(userProfileCreatedEventDto.payload);
  }
}
