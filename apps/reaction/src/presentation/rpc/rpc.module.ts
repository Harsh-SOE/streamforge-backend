import { Module } from '@nestjs/common';

import { LikeActionCommandHandler } from '@reaction/application/commands';
import { PlatformModule } from '@reaction/infrastructure/platform/platform.module';

import { RpcController } from './rpc.controller';
import { RpcService } from './rpc.service';

@Module({
  imports: [PlatformModule],
  controllers: [RpcController],
  providers: [...LikeActionCommandHandler, RpcService],
})
export class RpcModule {}
