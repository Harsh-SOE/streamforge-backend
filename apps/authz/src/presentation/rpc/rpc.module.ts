import { Module } from '@nestjs/common';

import { PlatformModule } from '@authz/infrastructure/platform/platform.module';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [PlatformModule],
  providers: [RpcService],
  controllers: [RpcController],
})
export class RpcModule {}
