import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import {
  REDIS_CACHE_HANDLER_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/cache/redis';
import {
  VIEWS_BUFFER_PORT,
  VIEWS_CACHE_PORT,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';
import {
  REDIS_BUFFER_HANDLER_CONFIG,
  RedisBufferHandler,
  RedisBufferHandlerConfig,
} from '@app/handlers/buffer/redis';
import {
  KAFKA_BUFFER_HANDLER_CONFIG,
  KafkaBufferHandler,
  KafkaBufferHandlerConfig,
} from '@app/handlers/buffer/kafka';
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
import { REDIS_CLIENT_CONFIG, RedisClient, RedisClientConfig } from '@app/clients/redis';
import { KAFKA_CLIENT_CONFIG, KafkaClient, KafkaClientConfig } from '@app/clients/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import { PrismaClient as ViewPrismaClient } from '@persistance/views';

import { MeasureModule } from '../measure';
import { ViewCacheAdapter } from '../cache/adapters';
import { ViewRepositoryAdapter } from '../repository/adapters';
import { ViewPeristanceAggregateACL } from '../anti-corruption';
import { ViewsConfigModule, ViewsConfigService } from '../config';
import { ViewsKafkaConsumerAdapter } from '../events-consumer/adapters';
import { ViewsKafkaPublisherAdapter } from '../events-publisher/adapters';
import { REDIS_STREAM_CONFIG, RedisStreamBufferAdapter, StreamConfig } from '../buffer/adapters';

@Global()
@Module({
  imports: [MeasureModule, CqrsModule, ViewsConfigModule],
  providers: [
    // handlers
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,
    RedisCacheHandler,
    RedisBufferHandler,
    KafkaBufferHandler,
    PrismaHandler,

    // client
    KafkaClient,
    RedisClient,
    PrismaDBClient,

    // ports and adapters
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: ViewsKafkaPublisherAdapter,
    },
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: ViewsKafkaConsumerAdapter,
    },
    { provide: VIEWS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: VIEWS_CACHE_PORT, useClass: ViewCacheAdapter },
    { provide: VIEWS_REPOSITORY_PORT, useClass: ViewRepositoryAdapter },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },

    // client configs
    {
      provide: LOKI_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: REDIS_STREAM_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          key: configService.REDIS_STREAM_KEY,
          groupName: configService.REDIS_STREAM_GROUPNAME,
        }) satisfies StreamConfig,
    },
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
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
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },

    // handler configs
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'views',
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
          dlqTopic: `dlq.views`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'views',
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
          dlqTopic: `dlq.views`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'views',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'views',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'views',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [ViewsConfigService],
      useFactory: (configService: ViewsConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'views',
          logErrors: true,
          resilienceOptions: {
            circuitBreakerThreshold: 50,
            halfOpenAfterMs: 10_000,
            maxRetries: 5,
          },
        }) satisfies KafkaBufferHandlerConfig,
    },

    // other providers
    ViewsConfigService,
    ViewPeristanceAggregateACL,
    {
      provide: PRISMA_CLIENT,
      useValue: ViewPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'views',
    },
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    ViewPeristanceAggregateACL,

    PrismaHandler,
    RedisCacheHandler,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    LOGGER_PORT,
    VIEWS_CACHE_PORT,
    VIEWS_BUFFER_PORT,
    EVENT_CONSUMER_PORT,
    EVENT_PUBLISHER_PORT,
    VIEWS_REPOSITORY_PORT,

    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_BUFFER_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
  ],
})
export class platformModule {}
