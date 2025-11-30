import { DatabaseFilter } from '@app/common/types';

import { User } from '@peristance/user';

import { UserQueryModel } from '@users/application/queries';

export interface UserQueryRepositoryPort {
  findOneById(id: string): Promise<UserQueryModel | null>;

  findOne(filter: DatabaseFilter<User>): Promise<UserQueryModel | null>;

  findMany(filter: DatabaseFilter<User>): Promise<UserQueryModel[]>;
}

export const USER_QUERY_REROSITORY_PORT = Symbol('USER_QUERY_REROSITORY_PORT');
