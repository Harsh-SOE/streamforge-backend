import { Module } from '@nestjs/common';

import {
  REDIS_BUFFER_HANDLER_CONFIG,
  RedisBufferHandler,
  RedisBufferHandlerConfig,
} from '@app/handlers/buffer/redis';

import { USER_REROSITORY_PORT } from '@users/application/ports';
import { UserConfigService } from '@users/infrastructure/config';
import { UserRepositoryAdapter } from '@users/infrastructure/database/prisma/adapters';

import { RedisBufferAdapter } from './adapters';

@Module({
  providers: [
    {
      provide: USER_REROSITORY_PORT,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    RedisBufferHandler,
    RedisBufferAdapter,
  ],
})
export class RedisBufferModule {}
