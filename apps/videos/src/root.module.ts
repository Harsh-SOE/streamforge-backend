import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { EventsModule } from './presentation/events';
import { PlatformModule } from './infrastructure/platform/platform.module';

@Module({
  imports: [ScheduleModule.forRoot(), RpcModule, EventsModule, PlatformModule],
})
export class RootModule {}
