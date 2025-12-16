import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  GetChannelFromIdDto,
  GetChannelResponse,
  GetUserProfileFromAuthIdDto,
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
} from '@app/contracts/query';

import {
  GetUserProfileFromAuthIdQuery,
  GetUserProfileFromIdQuery,
  GetChannelFromIdQuery,
} from '@query/queries';

@Injectable()
export class GrpcService {
  constructor(private readonly queryBus: QueryBus) {}

  getUserProfileFromIdQuery(getUserProfileFromIdDto: GetUserProfileFromIdDto) {
    return this.queryBus.execute<GetUserProfileFromIdQuery, GetUserProfileResponse>(
      new GetUserProfileFromIdQuery(getUserProfileFromIdDto),
    );
  }

  getUserProfileFromAuthIdQuery(getUserProfileFromAuthIdDto: GetUserProfileFromAuthIdDto) {
    return this.queryBus.execute<GetUserProfileFromAuthIdQuery, GetUserProfileResponse>(
      new GetUserProfileFromAuthIdQuery(getUserProfileFromAuthIdDto),
    );
  }

  getChannelFromId(getChannelFromIdDto: GetChannelFromIdDto) {
    return this.queryBus.execute<GetChannelFromIdQuery, GetChannelResponse>(
      new GetChannelFromIdQuery(getChannelFromIdDto),
    );
  }
}
