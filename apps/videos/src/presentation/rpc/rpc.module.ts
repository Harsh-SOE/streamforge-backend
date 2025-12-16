import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { VideoCommandHandlers } from '@videos/application/commands';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [CqrsModule],
  controllers: [RpcController],
  providers: [...VideoCommandHandlers, RpcService],
})
export class RpcModule {}
