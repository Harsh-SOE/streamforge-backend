import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  USER_QUERY_REPOSITORY_PORT,
  UserQueryRepositoryPort,
} from '@query/application/ports';

import { GetUserProfileResponse } from '@app/contracts/query';

import { GetUserProfileFromAuthIdQuery } from './get-user-profile-authid.query';

@QueryHandler(GetUserProfileFromAuthIdQuery)
export class GetUserProfileFromAuthIdHandler implements IQueryHandler<GetUserProfileFromAuthIdQuery> {
  constructor(
    @Inject(USER_QUERY_REPOSITORY_PORT)
    private readonly userQueryRepository: UserQueryRepositoryPort,
  ) {}

  async execute({
    getUserProfileFromAuthIdDto,
  }: GetUserProfileFromAuthIdQuery): Promise<GetUserProfileResponse> {
    const user = await this.userQueryRepository.getUserFromAuthId(
      getUserProfileFromAuthIdDto.userAuthId,
    );
    return {
      found: user ? true : false,
      user: user ?? undefined,
    };
  }
}
