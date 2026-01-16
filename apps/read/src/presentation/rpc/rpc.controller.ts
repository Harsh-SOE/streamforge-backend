import { Observable } from 'rxjs';
import { Controller, Inject, UseFilters } from '@nestjs/common';

import {
  GetChannelFromIdDto,
  GetChannelFromUserIdDto,
  GetChannelResponse,
  GetUserProfileFromAuthIdDto,
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
  ReadQueryServiceController,
  ReadQueryServiceControllerMethods,
} from '@app/contracts/read';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { GrpcFilter } from '../filters';
import { RpcService } from './rpc.service';

@Controller()
@UseFilters(GrpcFilter)
@ReadQueryServiceControllerMethods()
export class RpcController implements ReadQueryServiceController {
  public constructor(
    public readonly grpcService: RpcService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  getUserProfileFromId(
    getUserProfileFromIdDto: GetUserProfileFromIdDto,
  ): Promise<GetUserProfileResponse> | Observable<GetUserProfileResponse> | GetUserProfileResponse {
    this.logger.info(`Searching for user with id: ${getUserProfileFromIdDto.userId}`);
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
