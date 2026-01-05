import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueryHandlers } from '@query/queries';
import { PlatformModule } from '@query/infrastructure/platform/platform.module';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [CqrsModule, PlatformModule],
  providers: [...QueryHandlers, RpcService],
  controllers: [RpcController],
})
export class RpcModule {}
