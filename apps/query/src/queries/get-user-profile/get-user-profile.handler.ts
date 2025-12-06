import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserQueryRepositoryPort } from '@query/application/ports';
import { GetUserProfileResponse } from '@app/contracts/query';

import { GetUserProfileQuery } from './get-user-profile.query';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(private readonly userQueryRepository: UserQueryRepositoryPort) {}

  async execute({
    getUserProfileDto,
  }: GetUserProfileQuery): Promise<GetUserProfileResponse> {
    const user = await this.userQueryRepository.getUserFromId(
      getUserProfileDto.userId,
    );
    return {
      found: user ? true : false,
      user: user ?? undefined,
    };
  }
}
