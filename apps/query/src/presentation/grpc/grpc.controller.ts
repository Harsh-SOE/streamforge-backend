import { Controller, UseFilters } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  GetUserProfileFromAuthIdDto,
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
  QueryServiceController,
  QueryServiceControllerMethods,
} from '@app/contracts/query';

import { GrpcService } from './grpc.service';
import { GrpcFilter } from '../filters';

@Controller()
@UseFilters(GrpcFilter)
@QueryServiceControllerMethods()
export class GrpcController implements QueryServiceController {
  public constructor(public readonly grpcService: GrpcService) {}

  getUserProfileFromId(
    getUserProfileFromIdDto: GetUserProfileFromIdDto,
  ):
    | Promise<GetUserProfileResponse>
    | Observable<GetUserProfileResponse>
    | GetUserProfileResponse {
    return this.grpcService.getUserProfileFromIdQuery(getUserProfileFromIdDto);
  }

  getUserProfileFromAuthId(
    getUserProfileFromAuthIdDto: GetUserProfileFromAuthIdDto,
  ):
    | Promise<GetUserProfileResponse>
    | Observable<GetUserProfileResponse>
    | GetUserProfileResponse {
    return this.grpcService.getUserProfileFromAuthIdQuery(
      getUserProfileFromAuthIdDto,
    );
  }
}
