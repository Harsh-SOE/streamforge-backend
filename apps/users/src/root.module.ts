import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { MeasureModule } from '@users/infrastructure/measure';
import { UserConfigModule } from '@users/infrastructure/config';

import { RpcModule } from './presentation/rpc';
import { EventsModule } from './presentation/events';

@Module({
  imports: [RpcModule, EventsModule, MeasureModule, UserConfigModule, ScheduleModule.forRoot()],
})
export class RootModule {}
