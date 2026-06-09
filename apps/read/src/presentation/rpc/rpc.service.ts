import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  GetChannelFromIdDto,
  GetChannelFromUserIdDto,
  GetChannelResponse,
  GetUserProfileFromAuthIdDto,
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
} from '@app/contracts/protocols/read';

import {
  GetUserProfileFromAuthIdQuery,
  GetUserProfileFromIdQuery,
  GetChannelFromIdQuery,
  GetChannelFromUserIdQuery,
} from '@read/application/queries';

@Injectable()
export class RpcService {
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

  getChannelFromUserId(getChannelFromUserIdDto: GetChannelFromUserIdDto) {
    return this.queryBus.execute<GetChannelFromUserIdQuery, GetChannelResponse>(
      new GetChannelFromUserIdQuery(getChannelFromUserIdDto),
    );
  }
}
