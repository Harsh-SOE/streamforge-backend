import { Module } from '@nestjs/common';

import {
  KAFKA_BUFFER_HANDLER_CONFIG,
  KafkaBufferHandler,
  KafkaBufferHandlerConfig,
} from '@app/handlers/buffer/kafka';

import { USER_REROSITORY_PORT } from '@users/application/ports';
import { UserConfigService } from '@users/infrastructure/config';
import { UserRepositoryAdapter } from '@users/infrastructure/database/prisma/adapters';

import { KafkaBufferAdapter } from './adapters';

@Module({
  providers: [
    {
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies KafkaBufferHandlerConfig,
    },
    {
      provide: USER_REROSITORY_PORT,
      useClass: UserRepositoryAdapter,
    },
    KafkaBufferHandler,
    KafkaBufferAdapter,
  ],
})
export class KafkaBufferModule {}
