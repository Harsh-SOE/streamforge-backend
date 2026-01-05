// TODO: fix potential double instances of the clients...
// TODO: make a kafka buffer handler as well
import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

import { KAFKA_CLIENT_CONFIG, KafkaClient, KafkaClientConfig } from '@app/clients/kafka';
import {
  REDIS_CACHE_HANDLER_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/cache/redis';
import {
  REDIS_BUFFER_HANDLER_CONFIG,
  RedisBufferHandler,
  RedisBufferHandlerConfig,
} from '@app/handlers/buffer/redis';
import { KAFKA_BUFFER_HANDLER_CONFIG, KafkaBufferHandlerConfig } from '@app/handlers/buffer/kafka';
import {
  DATABASE_HANDLER_CONFIG,
  DatabaseConfig,
  PrismaHandler,
} from '@app/handlers/database/prisma';
import { LOGGER_PORT } from '@app/common/ports/logger';
import {
  KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
  KafkaEventConsumerHandler,
  KafkaEventConsumerHandlerConfig,
} from '@app/handlers/events-consumer/kafka';
import {
  KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
  KafkaEventPublisherHandler,
  KafkaEventPublisherHandlerConfig,
} from '@app/handlers/events-publisher/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import { REDIS_CLIENT_CONFIG, RedisClient, RedisClientConfig } from '@app/clients/redis';

import {
  USER_CACHE_PORT,
  USER_REROSITORY_PORT,
  USERS_BUFFER_PORT,
  USERS_STORAGE_PORT,
} from '@users/application/ports';
import { MeasureModule } from '@users/infrastructure/measure';
import { UserCommandHandlers } from '@users/application/commands';
import {
  REDIS_BUFFER_CONFIG,
  RedisBufferConfig,
  UsersRedisBuffer,
} from '@users/infrastructure/buffer/adapters';
import { RedisCacheAdapter } from '@users/infrastructure/cache/adapters';
import { UserEventHandlers } from '@users/application/intergration-events';
import { AwsS3StorageAdapter } from '@users/infrastructure/storage/adapters';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';
import { UserConfigModule, UserConfigService } from '@users/infrastructure/config';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClient as UserPrismaClient } from '@persistance/users';

import { UsersKafkaEventsPublisherAdapter } from '../events-publisher/adapters';
import { UsersKafkaEventsConsumerAdapter } from '../events-consumer/adapters';

@Global()
@Module({
  imports: [
    MeasureModule,
    CqrsModule,
    CacheModule.registerAsync({
      imports: [UserConfigModule],
      inject: [UserConfigService],
      isGlobal: true,
      useFactory: (configService: UserConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.REDIS_HOST,
        port: configService.REDIS_PORT,
      }),
    }),
  ],
  providers: [
    // handlers
    PrismaHandler,
    RedisCacheHandler,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,
    RedisBufferHandler,

    // clients
    PrismaDBClient,
    KafkaClient,
    RedisClient,

    // ports with adapters
    {
      provide: USER_REROSITORY_PORT,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: USER_CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: UsersKafkaEventsPublisherAdapter,
    },
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: UsersKafkaEventsConsumerAdapter,
    },
    { provide: USERS_BUFFER_PORT, useClass: UsersRedisBuffer },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    { provide: USERS_STORAGE_PORT, useClass: AwsS3StorageAdapter },

    // config
    // client configs
    {
      provide: LOKI_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) as LokiConfig,
    },
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          caCert: configService.KAFKA_CA_CERT,
          accessKey: configService.ACCESS_KEY,
          accessCert: configService.ACCESS_CERT,
        }) satisfies KafkaClientConfig,
    },
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },
    {
      provide: REDIS_BUFFER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          groupName: configService.REDIS_STREAM_GROUPNAME,
          key: configService.REDIS_STREAM_KEY,
        }) satisfies RedisBufferConfig,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: UserPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'users',
    },
    // handler configs
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
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: {
            circuitBreakerThreshold: 50,
            halfOpenAfterMs: 10_000,
            maxRetries: 5,
          },
          enableDlq: true,
          dlqOnApplicationException: true,
          dlqOnDomainException: false,
          sendToDlqAfterAttempts: 5,
          dlqTopic: `dlq.users`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: {
            circuitBreakerThreshold: 50,
            halfOpenAfterMs: 10_000,
            maxRetries: 5,
          },
          enableDlq: true,
          dlqOnApplicationException: true,
          dlqOnDomainException: false,
          sendToDlqAfterAttempts: 5,
          dlqTopic: `dlq.users`,
        }) satisfies KafkaEventPublisherHandlerConfig,
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
    ...UserCommandHandlers,
    ...UserEventHandlers,
    UserAggregatePersistanceACL,
  ],
  exports: [
    // miscs
    MeasureModule,
    CqrsModule,
    CacheModule,
    UserAggregatePersistanceACL,

    // handlers
    PrismaHandler,
    RedisCacheHandler,
    RedisBufferHandler,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,

    // clients
    KafkaClient,
    RedisClient,
    PrismaDBClient,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,

    // client configs
    DATABASE_HANDLER_CONFIG,
    REDIS_CACHE_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
    REDIS_BUFFER_HANDLER_CONFIG,
    KAFKA_BUFFER_HANDLER_CONFIG,
    KAFKA_CLIENT_CONFIG,
    REDIS_CLIENT_CONFIG,
    REDIS_BUFFER_CONFIG,
    LOKI_CONFIG,

    // ports
    LOGGER_PORT,
    USER_REROSITORY_PORT,
    EVENT_PUBLISHER_PORT,
    EVENT_CONSUMER_PORT,
    USERS_STORAGE_PORT,
    USERS_BUFFER_PORT,
    USER_CACHE_PORT,

    ...UserCommandHandlers,
    ...UserEventHandlers,
  ],
})
export class PlatformModule {}
