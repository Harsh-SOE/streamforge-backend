import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

import { TRANSCODER_PORT } from '@transcoder/application/ports';
import { TranscoderConfigModule, TranscoderConfigService } from '@transcoder/infrastructure/config';

import { REDIS_CACHE_HANDLER_CONFIG, RedisCacheHandlerConfig } from '@app/handlers/cache/redis';

import { FFmpegVideoTranscoderAdapter } from './adapters';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [TranscoderConfigModule],
      inject: [TranscoderConfigService],
      isGlobal: true,
      useFactory: (configService: TranscoderConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.REDIS_HOST,
        port: configService.REDIS_PORT,
      }),
    }),
  ],
  providers: [
    {
      provide: TRANSCODER_PORT,
      useClass: FFmpegVideoTranscoderAdapter,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
  ],
})
export class FFmpegModule {}
