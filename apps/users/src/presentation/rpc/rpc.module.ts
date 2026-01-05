import { Module } from '@nestjs/common';

import { PlatformModule } from '@users/infrastructure/platform';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [PlatformModule],
  controllers: [RpcController],
  providers: [RpcService],
})
export class RpcModule {}
