import { DatabaseFilter } from '@app/common/types';

import { UserAggregate } from '@users/domain/aggregates';

import { User } from '@peristance/user';

export interface UserCommandRepositoryPort {
  save(domain: UserAggregate): Promise<UserAggregate>;

  saveMany(domains: UserAggregate[]): Promise<number>;

  findOneById(id: string): Promise<UserAggregate | null>;

  findOne(filter: DatabaseFilter<User>): Promise<UserAggregate | null>;

  findMany(filter: DatabaseFilter<User>): Promise<UserAggregate[]>;

  updateOneById(id: string, updates: UserAggregate): Promise<UserAggregate>;

  updateOne(
    filter: DatabaseFilter<User>,
    updates: UserAggregate,
  ): Promise<UserAggregate>;

  updateMany(
    filter: DatabaseFilter<User>,
    updates: UserAggregate,
  ): Promise<number>;

  deleteOneById(id: string): Promise<boolean>;

  deleteOne(filter: DatabaseFilter<User>): Promise<boolean>;

  deleteMany(filter: DatabaseFilter<User>): Promise<number>;

  markAsOnboarded(id: string): Promise<UserAggregate>;
}

export const USER_COMMAND_REROSITORY_PORT = Symbol(
  'USER_COMMAND_REROSITORY_PORT',
);
