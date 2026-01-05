import { Module } from '@nestjs/common';

import { CommentCommandHandler } from '@comments/application/commands';
import { CommentEventHandler } from '@comments/application/integration-events';
import { PlatformModule } from '@comments/infrastructure/platform/platform.module';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [PlatformModule],
  controllers: [RpcController],
  providers: [RpcService, ...CommentCommandHandler, ...CommentEventHandler],
})
export class RpcModule {}
