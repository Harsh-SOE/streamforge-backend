import { Module } from '@nestjs/common';

import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';
import { GlobalEnvironmentModule } from '../environment';

@Module({
  imports: [GlobalEnvironmentModule],
  controllers: [GrpcController],
  providers: [GrpcService],
})
export class GrpcModule {}
