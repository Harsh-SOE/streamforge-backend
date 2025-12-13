/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthController,
  HealthControllerMethods,
} from '@app/contracts/health';

@Controller()
@HealthControllerMethods()
export class AppHealthController implements HealthController {
  check(
    authHealthCheckRequest: HealthCheckRequest,
  ): Promise<HealthCheckResponse> | Observable<HealthCheckResponse> | HealthCheckResponse {
    return { status: HealthCheckResponse_ServingStatus.SERVING };
  }
}
