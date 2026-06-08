import { Module } from '@nestjs/common';

import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import {
  DATABASE_HANDLER_CONFIG,
  DatabaseConfig,
  PrismaHandler,
} from '@app/handlers/database/prisma';

import { UserConfigService } from '@users/infrastructure/config';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClient } from '@persistance/users';

import { UserRepositoryAdapter } from './adapters';

@Module({
  providers: [
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'users',
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
      useValue: 'users',
    },
    UserAggregatePersistanceACL,
    PrismaHandler,
    PrismaDBClient,
    UserRepositoryAdapter,
  ],
})
export class PrismaDatabaseModule {}
