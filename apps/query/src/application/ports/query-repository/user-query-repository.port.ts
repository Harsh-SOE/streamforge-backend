import { UserQueryModel } from '@query/queries/models';

export interface UserQueryRepositoryPort {
  getUserFromId(userId: string): Promise<UserQueryModel | null>;
  getUserFromAuthId(authId: string): Promise<UserQueryModel | null>;
}

export const USER_QUERY_REPOSITORY_PORT = Symbol('USER_QUERY_REPOSITORY_PORT');
