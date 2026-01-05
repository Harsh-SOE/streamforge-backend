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
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { KAFKA_BUFFER_HANDLER_CONFIG, KafkaBufferHandler } from '@app/handlers/buffer/kafka';

import {
  CHANNEL_PROJECTION_REPOSITORY_PORT,
  USER_PROJECTION_REPOSITORY_PORT,
  PROJECTION_BUFFER_PORT,
  VIDEO_PROJECTION_REPOSITORY_PORT,
} from '@projection/application/ports';

import {
  ChannelProjectionModel,
  ChannelProjectionSchema,
  UserProjectionModel,
  VideoWatchProjectionModel,
  VideoWatchProjectionSchema,
  UserProjectionSchema,
} from '../repository/models';
import {
  ChannelProjectionRepository,
  UserProjectionRepository,
  VideoProjectionRepository,
} from '../repository/adapters';
import { KafkaBufferAdapter } from '../buffer/adapters';
import { ProjectionConfigModule, ProjectionConfigService } from '../config';
import { ProjectionKafkaConsumerAdapter } from '../events-consumer/adapters';
import { ProjectionKafkaPublisherAdapter } from '../events-producer/adapters';
import { ChannelProjectionACL, UserProjectionACL, VideoProjectionACL } from '../anti-corruption';

@Global()
@Module({
  imports: [
    ProjectionConfigModule,
    MongooseModule.forRootAsync({
      imports: [ProjectionConfigModule],
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) => ({
        uri: configService.DATABASE_URL,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: VideoWatchProjectionModel.name,
        schema: VideoWatchProjectionSchema,
      },
      {
        name: UserProjectionModel.name,
        schema: UserProjectionSchema,
      },
      {
        name: ChannelProjectionModel.name,
        schema: ChannelProjectionSchema,
      },
    ]),
  ],
  providers: [
    ProjectionConfigService,
    ChannelProjectionACL,
    UserProjectionACL,
    VideoProjectionACL,

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
      provide: CHANNEL_PROJECTION_REPOSITORY_PORT,
      useClass: ChannelProjectionRepository,
    },
    {
      provide: VIDEO_PROJECTION_REPOSITORY_PORT,
      useClass: VideoProjectionRepository,
    },
    { provide: EVENT_PUBLISHER_PORT, useClass: ProjectionKafkaPublisherAdapter },
    { provide: EVENT_CONSUMER_PORT, useClass: ProjectionKafkaConsumerAdapter },
    { provide: PROJECTION_BUFFER_PORT, useClass: KafkaBufferAdapter },
    {
      provide: LOGGER_PORT,
      useClass: LokiConsoleLogger,
    },

    // configs
    // handler configs

    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },

    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
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
      inject: [ProjectionConfigService],
      useFactory: (configService: ProjectionConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) satisfies RedisClientConfig,
    },

    // other configs
  ],
  exports: [
    ProjectionConfigService,
    VideoProjectionACL,
    ChannelProjectionACL,
    UserProjectionACL,
    KafkaClient,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,
    EVENT_PUBLISHER_PORT,
    EVENT_CONSUMER_PORT,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    LOGGER_PORT,
    VIDEO_PROJECTION_REPOSITORY_PORT,
    USER_PROJECTION_REPOSITORY_PORT,
    PROJECTION_BUFFER_PORT,
    CHANNEL_PROJECTION_REPOSITORY_PORT,
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
