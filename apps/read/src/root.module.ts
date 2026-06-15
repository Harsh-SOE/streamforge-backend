import { Module } from '@nestjs/common';

import { MeasureModule } from './infrastructure/measure';
import { RpcModule } from './presentation/rpc/rpc.module';
import { IntegrationEventsModule } from './presentation/integration-events/intergration-events.module';
import { AppHealthModule } from './infrastructure/health/health.module';
import { PlatformModule } from './infrastructure/platform/platform.module';

@Module({
  imports: [IntegrationEventsModule, RpcModule, AppHealthModule, MeasureModule, PlatformModule],
})
export class RootModule {}
