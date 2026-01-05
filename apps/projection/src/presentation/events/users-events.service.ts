import { Inject, Injectable } from '@nestjs/common';

import {
  OnboardedIntegrationEvent,
  ProfileUpdatedIntegrationEvent,
} from '@app/common/events/users';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  USER_PROJECTION_REPOSITORY_PORT,
  UserProjectionRepositoryPort,
} from '@projection/application/ports';

@Injectable()
export class UsersEventsService {
  public constructor(
    @Inject(USER_PROJECTION_REPOSITORY_PORT)
    private readonly userProjectionRespository: UserProjectionRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onUserProfileOnBoarded(userProfileCreatedEventDto: OnboardedIntegrationEvent) {
    // Implementation for handling user profile created projection event
    this.logger.info(`saving user projection`);
    await this.userProjectionRespository.saveUser(userProfileCreatedEventDto);
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
