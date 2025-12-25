import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { MeasureModule } from '@users/infrastructure/measure';
import { UserConfigModule } from '@users/infrastructure/config';

import { GrpcModule } from './presentation/rpc';

@Module({
  imports: [GrpcModule, MeasureModule, UserConfigModule, ScheduleModule.forRoot()],
})
export class RootModule {}
