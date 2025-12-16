import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RpcModule } from './presentation/rpc';
import { MessagesModule } from './presentation/messages';
import { FrameworkModule } from './infrastructure/framework/framework.module';

@Module({
  imports: [ScheduleModule.forRoot(), RpcModule, MessagesModule, FrameworkModule],
})
export class AppModule {}
