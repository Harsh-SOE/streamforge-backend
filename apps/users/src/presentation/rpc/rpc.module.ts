import { Module } from '@nestjs/common';

import { CoreModule } from '@users/infrastructure/core';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';
import { UserCommandHandlers } from '@users/application/commands';

@Module({
  imports: [CoreModule],
  controllers: [RpcController],
  providers: [RpcService, ...UserCommandHandlers],
})
export class RpcModule {}
