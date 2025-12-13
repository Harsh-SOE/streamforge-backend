import { UserProfileCreatedEventDto } from '@app/contracts/users';

export interface UserProjectionRepositoryPort {
  saveUser(data: UserProfileCreatedEventDto): Promise<boolean>;

  saveManyUser(data: UserProfileCreatedEventDto[]): Promise<number>;

  updateUser(userId: string, data: Partial<UserProfileCreatedEventDto>): Promise<boolean>;

  deleteUser(userId: string): Promise<boolean>;
}

export const USER_PROJECTION_REPOSITORY_PORT = Symbol('USER_PROJECTION_REPOSITORY_PORT');
