import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersFoundResponse } from '@app/contracts/users';

import {
  USER_QUERY_REROSITORY_PORT,
  UserQueryRepositoryPort,
} from '@users/application/ports';

import { FindAllUsersQuery } from './find-all-user.query';

@QueryHandler(FindAllUsersQuery)
export class FindAllUsersHandler implements IQueryHandler<FindAllUsersQuery> {
  public constructor(
    @Inject(USER_QUERY_REROSITORY_PORT)
    private readonly userRepo: UserQueryRepositoryPort,
  ) {}

  public async execute(): Promise<UsersFoundResponse> {
    const allUsers = await this.userRepo.findMany({});
    return {
      userPayload: allUsers.map((user) => ({
        ...user,
        dob: user.dob?.toISOString(),
        phoneNumber: user.phoneNumber ?? undefined,
      })),
    };
  }
}
