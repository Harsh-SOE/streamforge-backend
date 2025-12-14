import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  USER_CACHE_PORT,
  USER_REROSITORY_PORT,
  USERS_STORAGE_PORT,
} from '@users/application/ports';
import { MeasureModule } from '@users/infrastructure/measure';
import { UserKafkaClient } from '@users/infrastructure/message-broker/client';
import { AppConfigModule, AppConfigService } from '@users/infrastructure/config';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';
import { UserPrismaClient } from '@users/infrastructure/repository/client';
import { KafkaMessageBrokerAdapter } from '@users/infrastructure/message-broker/adapters';
import { RedisCacheAdapter } from '@users/infrastructure/cache/adapters';
import { WinstonLoggerAdapter } from '@users/infrastructure/logger';
import { AwsS3StorageAdapter } from '@users/infrastructure/storage/adapters';
import { UserCommandHandlers } from '@users/application/use-cases/commands';
import { UserEventHandlers } from '@users/application/events';

@Global()
@Module({
  imports: [
    MeasureModule,
    CqrsModule,
    CacheModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      isGlobal: true,
      useFactory: (configService: AppConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.REDIS_HOST,
        port: configService.REDIS_PORT,
      }),
    }),
  ],
  providers: [
    UserAggregatePersistanceACL,
    KafkaMessageBrokerHandler,
    PrismaDatabaseHandler,
    UserPrismaClient,
    UserKafkaClient,
    {
      provide: USER_REROSITORY_PORT,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: MESSAGE_BROKER,
      useClass: KafkaMessageBrokerAdapter,
    },
    {
      provide: USER_CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    { provide: USERS_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    CacheModule,
    UserAggregatePersistanceACL,
    KafkaMessageBrokerHandler,
    PrismaDatabaseHandler,
    UserPrismaClient,
    UserKafkaClient,
    USER_REROSITORY_PORT,
    MESSAGE_BROKER,
    USER_CACHE_PORT,
    LOGGER_PORT,
    USERS_STORAGE_PORT,
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class GlobalEnvironmentModule {}
