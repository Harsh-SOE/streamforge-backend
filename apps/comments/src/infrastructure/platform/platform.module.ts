import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
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
import { LOGGER_PORT } from '@app/common/ports/logger';
import { REDIS_CLIENT_CONFIG, RedisClientConfig, RedisClient } from '@app/clients/redis';
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
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

import {
  COMMENTS_BUFFER_PORT,
  COMMENTS_CACHE_PORT,
  COMMENTS_REPOSITORY_PORT,
} from '@comments/application/ports';

import {
  REDIS_BUFFER_CONFIG,
  RedisStreamBufferAdapter,
  RedisBufferConfig,
} from '../buffer/adapters';
import { MeasureModule } from '../measure';
import { CommentsConfigService } from '../config';
import { RedisCacheAdapter } from '../cache/adapters';
import { CommentAggregatePersistance } from '../anti-corruption';
import { PrismaMongoDBRepositoryAdapter } from '../repository/adapters';

import { PrismaClient as CommentsPrismaClient } from '@persistance/comments';
import { KAFKA_BUFFER_HANDLER_CONFIG, KafkaBufferHandler } from '@app/handlers/buffer/kafka';

@Global()
@Module({
  imports: [MeasureModule, CqrsModule],
  providers: [
    CommentsConfigService,
    CommentAggregatePersistance,

    // handlers
    PrismaHandler,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaBufferHandler,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,

    // clients
    KafkaClient,
    RedisClient,
    PrismaDBClient,

    // ports and adapters
    {
      provide: COMMENTS_REPOSITORY_PORT,
      useClass: PrismaMongoDBRepositoryAdapter,
    },
    { provide: COMMENTS_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: EVENT_PUBLISHER_PORT, useClass: KafkaEventPublisherHandler },
    { provide: EVENT_CONSUMER_PORT, useClass: KafkaEventConsumerHandler },
    { provide: COMMENTS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    {
      provide: LOGGER_PORT,
      useClass: LokiConsoleLogger,
    },

    // configs
    // handler configs
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'comments',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'comments',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'comments',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'comments',
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
          dlqTopic: `dlq.comments`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'comments',
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
          dlqTopic: `dlq.comments`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'comments',
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
          dlqTopic: `dlq.comments`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },

    // clients configs
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          key: configService.REDIS_STREAM_KEY,
          groupName: configService.REDIS_STREAM_GROUPNAME,
        }) satisfies RedisBufferConfig,
    },
    {
      provide: LOKI_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },

    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          caCert: configService.KAFKA_CA_CERT,
          accessCert: configService.ACCESS_CERT,
          accessKey: configService.ACCESS_KEY,
          clientId: configService.KAFKA_CLIENT_ID,
        }) satisfies KafkaClientConfig,
    },
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: CommentsPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'comments',
    },

    // other configs
    {
      provide: REDIS_BUFFER_CONFIG,
      inject: [CommentsConfigService],
      useFactory: (configService: CommentsConfigService) =>
        ({
          key: configService.REDIS_STREAM_KEY,
          groupName: configService.REDIS_STREAM_GROUPNAME,
        }) satisfies RedisBufferConfig,
    },
  ],
  exports: [
    CqrsModule,
    MeasureModule,
    CommentsConfigService,
    CommentAggregatePersistance,

    PrismaHandler,
    RedisCacheHandler,
    KafkaBufferHandler,
    RedisBufferHandler,

    PrismaHandler,
    RedisCacheHandler,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    KAFKA_BUFFER_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,

    LOGGER_PORT,
    EVENT_CONSUMER_PORT,
    COMMENTS_CACHE_PORT,
    EVENT_PUBLISHER_PORT,
    COMMENTS_BUFFER_PORT,
    COMMENTS_REPOSITORY_PORT,

    LOKI_CONFIG,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_CLIENT_CONFIG,
    REDIS_BUFFER_CONFIG,
    REDIS_CLIENT_CONFIG,
    DATABASE_HANDLER_CONFIG,
    REDIS_CACHE_HANDLER_CONFIG,
    REDIS_BUFFER_HANDLER_CONFIG,
  ],
})
export class PlatformModule {}
