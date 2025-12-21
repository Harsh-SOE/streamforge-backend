import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

import {
  KAFKA_ACCESS_CERT,
  KAFKA_ACCESS_KEY,
  KAFKA_CA_CERT,
  KAFKA_CLIENT,
  KAFKA_CONSUMER,
  KAFKA_HOST,
  KAFKA_PORT,
  KafkaClient,
} from '@app/clients/kafka';
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_STREAM_GROUPNAME,
  REDIS_STREAM_KEY,
  RedisClient,
} from '@app/clients/redis';
import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';

import {
  USER_CACHE_PORT,
  USER_REROSITORY_PORT,
  USERS_BUFFER_PORT,
  USERS_STORAGE_PORT,
} from '@users/application/ports';
import { MeasureModule } from '@users/infrastructure/measure';
import { UserEventHandlers } from '@users/application/events';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { WinstonLoggerAdapter } from '@users/infrastructure/logger';
import { RedisCacheAdapter } from '@users/infrastructure/cache/adapters';
import { UsersRedisBuffer } from '@users/infrastructure/buffer/adapters';
import { UserCommandHandlers } from '@users/application/use-cases/commands';
import { AwsS3StorageAdapter } from '@users/infrastructure/storage/adapters';
import { AppConfigModule, AppConfigService } from '@users/infrastructure/config';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';
import { KafkaMessageBrokerAdapter } from '@users/infrastructure/message-bus/adapters';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClient as UserPrismaClient } from '@persistance/users';

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
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,
    PrismaDBClient,
    KafkaClient,
    RedisClient,
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
    { provide: USERS_BUFFER_PORT, useClass: UsersRedisBuffer },
    {
      provide: KAFKA_HOST,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_HOST,
    },
    {
      provide: KAFKA_PORT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_PORT,
    },
    {
      provide: KAFKA_CLIENT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CLIENT_ID,
    },
    {
      provide: KAFKA_CA_CERT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CA_CERT,
    },
    {
      provide: KAFKA_ACCESS_CERT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.ACCESS_CERT,
    },
    {
      provide: KAFKA_ACCESS_KEY,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.ACCESS_KEY,
    },
    {
      provide: KAFKA_CONSUMER,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CONSUMER_ID,
    },
    {
      provide: REDIS_HOST,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_HOST,
    },
    {
      provide: REDIS_PORT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_PORT,
    },
    {
      provide: REDIS_STREAM_KEY,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_STREAM_KEY,
    },
    {
      provide: REDIS_STREAM_GROUPNAME,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_STREAM_GROUPNAME,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: UserPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'users',
    },
    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    CacheModule,
    UserAggregatePersistanceACL,

    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    USER_REROSITORY_PORT,
    MESSAGE_BROKER,
    USER_CACHE_PORT,
    LOGGER_PORT,
    USERS_STORAGE_PORT,
    USERS_BUFFER_PORT,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_CA_CERT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
    KAFKA_HOST,
    KAFKA_PORT,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_STREAM_GROUPNAME,
    REDIS_STREAM_KEY,

    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class FrameworkModule {}
