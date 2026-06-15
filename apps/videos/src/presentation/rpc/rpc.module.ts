import { Module } from '@nestjs/common';

import { INTEGRATION_EVENT_PUBLISHER_PORT } from '@app/common/ports/events';

import { VideoCommandHandlers } from '@videos/application/commands';
import { VideosAwsS3StorageAdapter } from '@videos/infrastructure/storage/aws-s3';
import { VideoPrismaRepositoryAdapter } from '@videos/infrastructure/database/prisma';
import { STORAGE_PORT, VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideosKafkaPublisherAdapter } from '@videos/infrastructure/integration-events-publisher/kafka';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  controllers: [RpcController],
  providers: [
    {
      provide: VIDEOS_RESPOSITORY_PORT,
      useClass: VideoPrismaRepositoryAdapter,
    },
    {
      provide: STORAGE_PORT,
      useClass: VideosAwsS3StorageAdapter,
    },
    {
      provide: INTEGRATION_EVENT_PUBLISHER_PORT,
      useClass: VideosKafkaPublisherAdapter,
    },
    ...VideoCommandHandlers,
    RpcService,
  ],
})
export class RpcModule {}
