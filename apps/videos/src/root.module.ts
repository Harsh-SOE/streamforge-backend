import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { EventsModule } from './presentation/events';
import { CoreModule } from './infrastructure/core/core.module';

@Module({
  imports: [ScheduleModule.forRoot(), RpcModule, EventsModule, CoreModule],
})
export class RootModule {}
