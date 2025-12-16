import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueryHandlers } from '@query/queries/handlers';
import { FrameworkModule } from '@query/infrastructure/framework/framework.module';

import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';

@Module({
  imports: [CqrsModule, FrameworkModule],
  providers: [...QueryHandlers, GrpcService],
  controllers: [GrpcController],
})
export class GrpcModule {}
