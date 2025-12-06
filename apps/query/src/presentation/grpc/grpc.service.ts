import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
} from '@app/contracts/query';

import { GetUserProfileQuery } from '@query/queries';

@Injectable()
export class GrpcService {
  constructor(private readonly queryBus: QueryBus) {}

  getUserProfileQuery(getUserProfileFromIdDto: GetUserProfileFromIdDto) {
    return this.queryBus.execute<GetUserProfileQuery, GetUserProfileResponse>(
      new GetUserProfileQuery(getUserProfileFromIdDto),
    );
  }
}
