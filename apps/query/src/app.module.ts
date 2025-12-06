import { Module } from '@nestjs/common';
import { AppConfigModule } from './infrastructure/config/config.module';
import { GrpcModule } from './presentation/grpc/grpc.module';

@Module({
  imports: [AppConfigModule, GrpcModule],
})
export class AppModule {}
