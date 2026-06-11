import { Module } from '@nestjs/common';
import {
  REDIS_CACHE_HANDLER_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/cache/redis';
import { VideosConfigService } from '@videos/infrastructure/config';

@Module({
  providers: [
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'videos',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    RedisCacheHandler,
  ],
})
export class RedisCacheModule {}
