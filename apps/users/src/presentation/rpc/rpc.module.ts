import { Module } from '@nestjs/common';

import { FrameworkModule } from '@users/infrastructure/framework';

import { GrpcService } from './rpc.service';
import { GrpcController } from './rpc.controller';

@Module({
  imports: [FrameworkModule],
  controllers: [GrpcController],
  providers: [GrpcService],
})
export class GrpcModule {}
