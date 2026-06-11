import { Module } from '@nestjs/common';

import { EVENT_PUBLISHER_PORT } from '@app/common/ports/events';

import { VideoCommandHandlers } from '@videos/application/commands';
import { AwsS3StorageAdapter } from '@videos/infrastructure/storage/aws-s3';
import { VideoRepositoryAdapter } from '@videos/infrastructure/database/prisma';
import { STORAGE_PORT, VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideosKafkaPublisherAdapter } from '@videos/infrastructure/events-publisher/kafka';

import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';

@Module({
  controllers: [RpcController],
  providers: [
    {
      provide: VIDEOS_RESPOSITORY_PORT,
      useClass: VideoRepositoryAdapter,
    },
    {
      provide: STORAGE_PORT,
      useClass: AwsS3StorageAdapter,
    },
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: VideosKafkaPublisherAdapter,
    },
    ...VideoCommandHandlers,
    RpcService,
  ],
})
export class RpcModule {}
