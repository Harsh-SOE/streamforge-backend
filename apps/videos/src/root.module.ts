import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { IntegrationEventsConsumerModule } from './presentation/integration-events';
import { CoreModule } from './infrastructure/core/core.module';

@Module({
  imports: [ScheduleModule.forRoot(), RpcModule, IntegrationEventsConsumerModule, CoreModule],
})
export class RootModule {}
