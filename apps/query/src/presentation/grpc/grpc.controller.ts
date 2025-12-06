import { Controller } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  GetUserProfileFromIdDto,
  GetUserProfileResponse,
  QueryServiceController,
} from '@app/contracts/query';

import { GrpcService } from './grpc.service';

@Controller('grpc')
export class GrpcController implements QueryServiceController {
  public constructor(public readonly grpcService: GrpcService) {}

  getUserProfile(
    getUserProfileFromIdDto: GetUserProfileFromIdDto,
  ):
    | Promise<GetUserProfileResponse>
    | Observable<GetUserProfileResponse>
    | GetUserProfileResponse {
    return this.grpcService.getUserProfileQuery(getUserProfileFromIdDto);
  }
}
