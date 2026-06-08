import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { CoreModule } from './infrastructure/core';
import { EventsModule } from './presentation/events';

@Module({
  imports: [RpcModule, EventsModule, CoreModule, ScheduleModule.forRoot()],
})
export class RootModule {}
