import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
import { REDIS_CLIENT_CONFIG, RedisClientConfig } from '@app/clients/redis';
import {
  INTEGRATION_EVENT_CONSUMER_PORT,
  INTEGRATION_EVENT_PUBLISHER_PORT,
} from '@app/common/ports/events';
import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { KAFKA_BUFFER_HANDLER_CONFIG, KafkaBufferHandler } from '@app/handlers/buffer/kafka';

import {
  CHANNEL_PROJECTION_REPOSITORY_PORT,
  USER_PROJECTION_REPOSITORY_PORT,
  PROJECTION_BUFFER_PORT,
  VIDEO_PROJECTION_REPOSITORY_PORT,
  CHANNEL_QUERY_REPOSITORY_PORT,
  USER_QUERY_REPOSITORY_PORT,
} from '@read/application/ports';

import {
  ChannelProjectionACL,
  UserProjectionACL,
  VideoProjectionACL,
  ChannelQueryACL,
  UserQueryACL,
} from '../anti-corruption';
import {
  ChannelReadMongooseModel,
  ChannelReadMongooseSchema,
  UserReadMongooseModel,
  VideoWatchReadMongooseModel,
  VideoWatchReadMongooseSchema,
  UserReadMongooseSchema,
} from '../repository/models';
import {
  ChannelProjectionRepository,
  UserProjectionRepository,
  VideoProjectionRepository,
  ChannelQueryRepository,
  UserQueryRepository,
} from '../repository/adapters';
import { KafkaBufferAdapter } from '../buffer/adapters';
import { ReadConfigModule, ReadConfigService } from '../config';
import { ReadKafkaConsumerAdapter } from '../integration-events-consumer/adapters';
import { ReadKafkaPublisherAdapter } from '../integration-events-producer/adapters';

@Global()
@Module({
  imports: [
    CqrsModule,
    ReadConfigModule,
    MongooseModule.forRootAsync({
      imports: [ReadConfigModule],
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) => ({
        uri: configService.DATABASE_URL,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: VideoWatchReadMongooseModel.name,
        schema: VideoWatchReadMongooseSchema,
      },
      {
        name: UserReadMongooseModel.name,
        schema: UserReadMongooseSchema,
      },
      {
        name: ChannelReadMongooseModel.name,
        schema: ChannelReadMongooseSchema,
      },
    ]),
  ],
  providers: [
    ReadConfigService,
    ChannelProjectionACL,
    UserProjectionACL,
    VideoProjectionACL,
    UserQueryACL,
    ChannelQueryACL,

    // handlers
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaBufferHandler,
    KafkaEventPublisherHandler,
    KafkaEventConsumerHandler,

    // clients
    KafkaClient,

    // ports and adapters
    {
      provide: USER_PROJECTION_REPOSITORY_PORT,
      useClass: UserProjectionRepository,
    },
    {
      provide: USER_QUERY_REPOSITORY_PORT,
      useClass: UserQueryRepository,
    },
    {
      provide: CHANNEL_PROJECTION_REPOSITORY_PORT,
      useClass: ChannelProjectionRepository,
    },
    {
      provide: CHANNEL_QUERY_REPOSITORY_PORT,
      useClass: ChannelQueryRepository,
    },
    {
      provide: VIDEO_PROJECTION_REPOSITORY_PORT,
      useClass: VideoProjectionRepository,
    },
    { provide: INTEGRATION_EVENT_PUBLISHER_PORT, useClass: ReadKafkaPublisherAdapter },
    { provide: INTEGRATION_EVENT_CONSUMER_PORT, useClass: ReadKafkaConsumerAdapter },
    { provide: PROJECTION_BUFFER_PORT, useClass: KafkaBufferAdapter },
    {
      provide: LOGGER_PORT,
      useClass: LokiConsoleLogger,
    },

    // configs
    // handler configs

    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
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
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
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
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'projection',
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
          dlqTopic: `dlq.projection`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'projection',
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
          dlqTopic: `dlq.projection`,
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'projection',
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
          dlqTopic: `dlq.projection`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },

    // clients configs
    {
      provide: LOKI_CONFIG,
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },

    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
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
      inject: [ReadConfigService],
      useFactory: (configService: ReadConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },

    // other configs
  ],
  exports: [
    CqrsModule,
    ReadConfigService,
    VideoProjectionACL,
    ChannelProjectionACL,
    UserProjectionACL,
    UserQueryACL,
    ChannelQueryACL,
    KafkaClient,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,
    INTEGRATION_EVENT_PUBLISHER_PORT,
    INTEGRATION_EVENT_CONSUMER_PORT,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    LOGGER_PORT,
    VIDEO_PROJECTION_REPOSITORY_PORT,
    USER_PROJECTION_REPOSITORY_PORT,
    PROJECTION_BUFFER_PORT,
    CHANNEL_PROJECTION_REPOSITORY_PORT,
    USER_QUERY_REPOSITORY_PORT,
    CHANNEL_QUERY_REPOSITORY_PORT,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaBufferHandler,
    KAFKA_BUFFER_HANDLER_CONFIG,
    REDIS_BUFFER_HANDLER_CONFIG,
    REDIS_CACHE_HANDLER_CONFIG,
    REDIS_CLIENT_CONFIG,
  ],
})
export class PlatformModule {}
