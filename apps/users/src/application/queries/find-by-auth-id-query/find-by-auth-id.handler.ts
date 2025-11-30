import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserFoundResponse } from '@app/contracts/users';

import {
  USER_QUERY_REROSITORY_PORT,
  UserQueryRepositoryPort,
} from '@users/application/ports';

import { FindUserByAuthIdQuery } from './find-by-auth-id.query';

@QueryHandler(FindUserByAuthIdQuery)
export class FindUserByAuthIdQueryHandler implements IQueryHandler<FindUserByAuthIdQuery> {
  constructor(
    @Inject(USER_QUERY_REROSITORY_PORT)
    private readonly userRepo: UserQueryRepositoryPort,
  ) {}

  async execute({
    findUserbyAuthIdDto,
  }: FindUserByAuthIdQuery): Promise<UserFoundResponse> {
    const { authId } = findUserbyAuthIdDto;
    const user = await this.userRepo.findOne({ authUserId: authId });

    return {
      user: user
        ? {
            ...user,
            dob: user.dob?.toISOString(),
            phoneNumber: user.phoneNumber ?? undefined,
          }
        : undefined,
    };
  }
}
