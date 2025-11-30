import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  USER_QUERY_REROSITORY_PORT,
  UserQueryRepositoryPort,
} from '@users/application/ports';
import { UserNotFoundException } from '@users/application/exceptions';

import { UserFoundResponse } from '@app/contracts/users';

import { FindUserByIdQuery } from './find-user-by-id.query';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(
    @Inject(USER_QUERY_REROSITORY_PORT)
    private readonly userRepo: UserQueryRepositoryPort,
  ) {}

  async execute({
    userFindByIdDto,
  }: FindUserByIdQuery): Promise<UserFoundResponse> {
    const { id } = userFindByIdDto;
    const user = await this.userRepo.findOneById(id);

    if (!user) {
      throw new UserNotFoundException({
        message: `User with id: ${id} was not found in the database`,
      });
    }

    return {
      user: {
        ...user,
        dob: user.dob?.toISOString(),
        phoneNumber: user.phoneNumber ?? undefined,
      },
    };
  }
}
