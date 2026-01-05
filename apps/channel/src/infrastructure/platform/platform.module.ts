import { Global, Module } from '@nestjs/common';

import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import {
  REDIS_CACHE_HANDLER_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/cache/redis';
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
import { REDIS_CLIENT_CONFIG, RedisClientConfig, RedisClient } from '@app/clients/redis';
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import {
  REDIS_BUFFER_HANDLER_CONFIG,
  RedisBufferHandler,
  RedisBufferHandlerConfig,
} from '@app/handlers/buffer/redis';

import { CHANNEL_REPOSITORY, CHANNEL_STORAGE_PORT } from '@channel/application/ports';

import { PrismaClient } from '@persistance/channel';

import { AwsS3StorageAdapter } from '../storage/adapters';
import { ChannelRepositoryAdapter } from '../repository/adapters';
import { ChannelAggregatePersistanceACL } from '../anti-corruption';
import { ChannelConfigModule, ChannelConfigService } from '../config';
import { ChannelKafkaConsumerAdapter } from '../events-consumer/adapters';
import { ChannelKafkaPublisherAdapter } from '../events-publisher/adapters';

@Global()
@Module({
  imports: [ChannelConfigModule],
  providers: [
    ChannelConfigService,

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
      provide: CHANNEL_REPOSITORY,
      useClass: ChannelRepositoryAdapter,
    },
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: ChannelKafkaPublisherAdapter,
    },
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: ChannelKafkaConsumerAdapter,
    },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    { provide: CHANNEL_STORAGE_PORT, useClass: AwsS3StorageAdapter },

    // config
    // client configs
    {
      provide: LOKI_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
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
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },

    {
      provide: PRISMA_CLIENT,
      useValue: PrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'users',
    },
    // handler configs
    {
      provide: DATABASE_HANDLER_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
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
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
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
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
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
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'users',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    ChannelAggregatePersistanceACL,
  ],
  exports: [
    ChannelConfigService,
    ChannelAggregatePersistanceACL,
    RedisCacheHandler,
    PrismaHandler,
    PrismaDBClient,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,
    KafkaClient,
    RedisClient,
    CHANNEL_REPOSITORY,
    CHANNEL_STORAGE_PORT,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
    KAFKA_CLIENT_CONFIG,
    REDIS_CLIENT_CONFIG,
    DATABASE_HANDLER_CONFIG,
    REDIS_CACHE_HANDLER_CONFIG,
    REDIS_BUFFER_HANDLER_CONFIG,
    EVENT_CONSUMER_PORT,
    EVENT_PUBLISHER_PORT,
    LOGGER_PORT,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
  ],
})
export class PlatformModule {}
