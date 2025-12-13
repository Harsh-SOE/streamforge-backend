/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthController,
  HealthControllerMethods,
} from '@app/contracts/health';
import { Controller } from '@nestjs/common';
import { Observable } from 'rxjs';

@Controller()
@HealthControllerMethods()
export class AppHealthController implements HealthController {
  /**
   * Health check for the authentication service.
   *
   * Returns a response with a `status` field that is either 1 (SERVING) or 2 (NOT_SERVING).
   *
   * @param {HealthCheckRequest} authHealthCheckRequest - The health check request.
   * @returns {Promise<HealthCheckResponse>|Observable<HealthCheckResponse>|HealthCheckResponse} - The health check response.
   */
  check(
    authHealthCheckRequest: HealthCheckRequest,
  ): Promise<HealthCheckResponse> | Observable<HealthCheckResponse> | HealthCheckResponse {
    return { status: HealthCheckResponse_ServingStatus.SERVING };
  }
}
