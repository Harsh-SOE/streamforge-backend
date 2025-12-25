import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppHealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 200 * 1024 * 1024),
      async () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 1.0,
          path: '/',
        }),
    ]);
  }
}
