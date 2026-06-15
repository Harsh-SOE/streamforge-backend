import { Module } from '@nestjs/common';

import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import {
  DATABASE_HANDLER_CONFIG,
  DatabaseConfig,
  PrismaHandler,
} from '@app/handlers/database/prisma';

import { PrismaClient } from '@persistance/videos';

import { VideosConfigService } from '@videos/infrastructure/config';
import { VideoAggregatePersistanceACL } from '@videos/infrastructure/anti-corruption';

@Module({
  providers: [
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [VideosConfigService],
      useFactory: (configService: VideosConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'videos',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: PrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'videos',
    },
    PrismaHandler,
    PrismaDBClient,
    VideoAggregatePersistanceACL,
  ],
})
export class PrismaDatabaseModule {}
