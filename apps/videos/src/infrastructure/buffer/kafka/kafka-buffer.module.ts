import { Module } from '@nestjs/common';

import {
  KAFKA_BUFFER_HANDLER_CONFIG,
  KafkaBufferHandler,
  KafkaBufferHandlerConfig,
} from '@app/handlers/buffer/kafka';

import { VideosConfigService } from '@videos/infrastructure/config';
import { VIDEOS_RESPOSITORY_PORT } from '@videos/application/ports';
import { VideoPrismaRepositoryAdapter } from '@videos/infrastructure/database/prisma';

@Module({
  providers: [
    {
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'videos',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies KafkaBufferHandlerConfig,
    },
    { provide: VIDEOS_RESPOSITORY_PORT, useClass: VideoPrismaRepositoryAdapter },
    KafkaBufferHandler,
  ],
})
export class KafkaBufferModule {}
