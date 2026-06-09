import { Module } from '@nestjs/common';

import { UserCommandHandlers } from '@users/application/commands';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  controllers: [RpcController],
  providers: [RpcService, ...UserCommandHandlers],
})
export class RpcModule {}
