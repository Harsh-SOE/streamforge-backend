import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  GetChannelFromIdDto,
  GetChannelFromUserIdDto,
  GetChannelResponse,
  GetUserProfileFromAuthIdDto,
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
  QueryServiceController,
  QueryServiceControllerMethods,
} from '@app/contracts/query';

import { GrpcFilter } from '../filters';
import { RpcService } from './rpc.service';

@Controller()
@UseFilters(GrpcFilter)
@QueryServiceControllerMethods()
export class RpcController implements QueryServiceController {
  public constructor(public readonly grpcService: RpcService) {}

  getUserProfileFromId(
    getUserProfileFromIdDto: GetUserProfileFromIdDto,
  ): Promise<GetUserProfileResponse> | Observable<GetUserProfileResponse> | GetUserProfileResponse {
    return this.grpcService.getUserProfileFromIdQuery(getUserProfileFromIdDto);
  }

  getUserProfileFromAuthId(
    getUserProfileFromAuthIdDto: GetUserProfileFromAuthIdDto,
  ): Promise<GetUserProfileResponse> | Observable<GetUserProfileResponse> | GetUserProfileResponse {
    return this.grpcService.getUserProfileFromAuthIdQuery(getUserProfileFromAuthIdDto);
  }

  getChannelFromId(
    getChannelFromIdDto: GetChannelFromIdDto,
  ): Promise<GetChannelResponse> | Observable<GetChannelResponse> | GetChannelResponse {
    return this.grpcService.getChannelFromId(getChannelFromIdDto);
  }

  getChannelFromUserId(
    getChannelFromUserIdDto: GetChannelFromUserIdDto,
  ): Promise<GetChannelResponse> | Observable<GetChannelResponse> | GetChannelResponse {
    return this.grpcService.getChannelFromUserId(getChannelFromUserIdDto);
  }
}
