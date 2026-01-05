import {
  OnboardedIntegrationEvent,
  ProfileUpdatedIntegrationEvent,
} from '@app/common/events/users';

export interface UserProjectionRepositoryPort {
  saveUser(data: OnboardedIntegrationEvent): Promise<boolean>;

  saveManyUser(data: OnboardedIntegrationEvent[]): Promise<number>;

  updateUser(userId: string, data: Partial<ProfileUpdatedIntegrationEvent>): Promise<boolean>;

  deleteUser(userId: string): Promise<boolean>;
}

export const USER_PROJECTION_REPOSITORY_PORT = Symbol('USER_PROJECTION_REPOSITORY_PORT');
