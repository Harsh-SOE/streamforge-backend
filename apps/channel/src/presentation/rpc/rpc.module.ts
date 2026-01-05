import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ChannelEventHandler } from '@channel/application/integration-events';
import { ChannelCommandHandlers } from '@channel/application/commands/handlers';

import { RpcController } from './rpc.controller';
import { RpcService } from './rpc.service';

@Module({
  imports: [CqrsModule],
  providers: [RpcService, ...ChannelCommandHandlers, ...ChannelEventHandler],
  controllers: [RpcController],
})
export class RpcModule {}
