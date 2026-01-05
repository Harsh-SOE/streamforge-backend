import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { AppHealthService } from './health.service';

@Controller('health')
export class AppHealthController {
  public constructor(
    private readonly healthCheck: HealthCheckService,
    private readonly healthService: AppHealthService,
  ) {}

  @Get()
  @HealthCheck()
  monitor() {
    return this.healthCheck.check([() => this.healthService.isHealthy('kafka')]);
  }
}
