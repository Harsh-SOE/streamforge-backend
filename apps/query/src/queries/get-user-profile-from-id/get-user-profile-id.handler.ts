import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserProfileResponse } from '@app/contracts/query';

import { USER_QUERY_REPOSITORY_PORT, UserQueryRepositoryPort } from '@query/application/ports';

import { GetUserProfileFromIdQuery } from './get-user-profile-id.query';

@QueryHandler(GetUserProfileFromIdQuery)
export class GetUserProfileFromIdHandler implements IQueryHandler<GetUserProfileFromIdQuery> {
  constructor(
    @Inject(USER_QUERY_REPOSITORY_PORT)
    private readonly userQueryRepository: UserQueryRepositoryPort,
  ) {}

  async execute({ getUserProfileDto }: GetUserProfileFromIdQuery): Promise<GetUserProfileResponse> {
    const user = await this.userQueryRepository.getUserFromId(getUserProfileDto.userId);
    return {
      found: user ? true : false,
      user: user ?? undefined,
    };
  }
}
