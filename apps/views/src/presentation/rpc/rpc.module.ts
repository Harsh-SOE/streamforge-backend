import { Module } from '@nestjs/common';

import { platformModule } from '@views/infrastructure/platform/platform.module';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  imports: [platformModule],
  controllers: [RpcController],
  providers: [RpcService],
})
export class RpcModule {}
