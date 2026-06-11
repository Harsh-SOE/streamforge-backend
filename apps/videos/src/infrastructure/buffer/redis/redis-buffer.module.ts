import { Module } from '@nestjs/common';

import {
  REDIS_BUFFER_HANDLER_CONFIG,
  RedisBufferHandler,
  RedisBufferHandlerConfig,
} from '@app/handlers/buffer/redis';

import { VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideosConfigService } from '@videos/infrastructure/config';

import { StreamConfig, VIDEOS_REDIS_STREAM_CONFIG } from './adapters';
import { VideoRepositoryAdapter } from '@videos/infrastructure/database/prisma';

@Module({
  providers: [
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'videos',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    { provide: VIDEOS_RESPOSITORY_PORT, useClass: VideoRepositoryAdapter },
    {
      provide: VIDEOS_REDIS_STREAM_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          groupName: configService.REDIS_STREAM_GROUPNAME,
          key: configService.REDIS_STREAM_KEY,
        }) satisfies StreamConfig,
    },
    RedisBufferHandler,
  ],
})
export class RedisBufferModule {}
