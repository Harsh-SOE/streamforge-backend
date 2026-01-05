import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { MeasureModule } from './infrastructure/measure';
import { ChannelConfigModule } from './infrastructure/config';
import { PlatformModule } from '@channel/infrastructure/platform/platform.module';

@Module({
  imports: [
    ChannelConfigModule,
    RpcModule,
    MeasureModule,
    ScheduleModule.forRoot(),
    PlatformModule,
  ],
})
export class RootModule {}
