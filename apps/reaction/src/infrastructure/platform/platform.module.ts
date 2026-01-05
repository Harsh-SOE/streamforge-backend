import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

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
import {
  DATABASE_HANDLER_CONFIG,
  DatabaseConfig,
  PrismaHandler,
} from '@app/handlers/database/prisma';
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
import { LOGGER_PORT } from '@app/common/ports/logger';
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import { REDIS_CLIENT_CONFIG, RedisClientConfig, RedisClient } from '@app/clients/redis';
import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import {
  REACTION_BUFFER_PORT,
  REACTION_CACHE_PORT,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';

import { PrismaClient as ReactionPrismaClient } from '@persistance/reaction';

import {
  REDIS_BUFFER_CONFIG,
  RedisStreamBufferAdapter,
  RedisStreamConfig,
} from '../buffer/adapters';
import { MeasureModule } from '../measure';
import { ReactionConfigService } from '../config';
import { RedisCacheAdapter } from '../cache/adapters';
import { ReactionRepositoryAdapter } from '../repository/adapters';
import { ReactionAggregatePersistanceACL } from '../anti-corruption';
import { ReactionKafkaConsumerAdapter } from '../events-consumer/adapters';
import { ReactionKafkaPublisherAdapter } from '../events-publisher/adapters';
import {
  KAFKA_BUFFER_HANDLER_CONFIG,
  KafkaBufferHandler,
  KafkaBufferHandlerConfig,
} from '@app/handlers/buffer/kafka';

@Global()
@Module({
  imports: [MeasureModule, CqrsModule],
  providers: [
    // handlers
    PrismaHandler,
    RedisCacheHandler,
    RedisBufferHandler,
    KafkaBufferHandler,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,

    // clients
    KafkaClient,
    RedisClient,
    PrismaDBClient,

    // ports and adapters
    { provide: REACTION_DATABASE_PORT, useClass: ReactionRepositoryAdapter },
    { provide: REACTION_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: EVENT_PUBLISHER_PORT, useClass: ReactionKafkaPublisherAdapter },
    { provide: EVENT_CONSUMER_PORT, useClass: ReactionKafkaConsumerAdapter },
    { provide: REACTION_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },

    // configs
    // handlers configs
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'reaction',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'reaction',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'reaction',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
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
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
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
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'reaction',
          logErrors: true,
          resilienceOptions: {
            maxRetries: 5,
            halfOpenAfterMs: 10_000,
            circuitBreakerThreshold: 50,
          },
        }) satisfies KafkaBufferHandlerConfig,
    },
    // client config
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          accessCert: configService.ACCESS_CERT,
          accessKey: configService.ACCESS_KEY,
          caCert: configService.KAFKA_CA_CERT,
        }) satisfies KafkaClientConfig,
    },
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },
    {
      provide: LOKI_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: REDIS_BUFFER_CONFIG,
      inject: [ReactionConfigService],
      useFactory: (configService: ReactionConfigService) =>
        ({
          key: configService.REDIS_STREAM_KEY,
          groupName: configService.REDIS_STREAM_GROUPNAME,
        }) satisfies RedisStreamConfig,
    },

    {
      provide: PRISMA_CLIENT,
      useValue: ReactionPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'reaction',
    },

    // others
    ReactionConfigService,
    ReactionAggregatePersistanceACL,
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    ReactionAggregatePersistanceACL,

    PrismaHandler,
    RedisCacheHandler,
    KafkaBufferHandler,
    RedisBufferHandler,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    LOGGER_PORT,
    EVENT_CONSUMER_PORT,
    REACTION_CACHE_PORT,
    REACTION_BUFFER_PORT,
    EVENT_PUBLISHER_PORT,
    REACTION_DATABASE_PORT,

    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
    KAFKA_BUFFER_HANDLER_CONFIG,
    REDIS_BUFFER_HANDLER_CONFIG,

    REDIS_BUFFER_CONFIG,
    KAFKA_CLIENT_CONFIG,
    REDIS_CLIENT_CONFIG,
    PRISMA_CLIENT_NAME,
    PRISMA_CLIENT,
    LOKI_CONFIG,
  ],
})
export class PlatformModule {}
