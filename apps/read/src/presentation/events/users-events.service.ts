import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { UserProjectionEvent } from '@app/common/events/projections';
import { ProfileUpdatedIntegrationEvent } from '@app/common/events/users';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  UserProjectionRepositoryPort,
} from '@read/application/ports';

@Injectable()
export class UsersEventsService {
  public constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRespository: UserProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onUserProfileOnBoarded(userProfileCreatedEventDto: UserProjectionEvent) {
    this.logger.info(`saving user projection`);
    await this.userProjectionRespository.saveUser(userProfileCreatedEventDto.payload);
  }

  public async onUserProfileUpdated(
    profileUpdatedIntegrationEvent: ProfileUpdatedIntegrationEvent,
  ) {
    // Implementation for handling user profile updated projection event
    this.logger.info(`updating user projection`);
    await this.userProjectionRespository.updateUser(
      profileUpdatedIntegrationEvent.payload.userId,
      profileUpdatedIntegrationEvent,
    );
  }
}
