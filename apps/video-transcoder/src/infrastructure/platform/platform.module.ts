import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import {
  REDIS_CACHE_HANDLER_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/cache/redis';
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
import { KAFKA_BUFFER_HANDLER_CONFIG } from '@app/handlers/buffer/kafka';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';
import { KAFKA_CLIENT_CONFIG, KafkaClientConfig, KafkaClient } from '@app/clients/kafka';
import { REDIS_CLIENT_CONFIG, RedisClientConfig, RedisClient } from '@app/clients/redis';
import { REDIS_BUFFER_HANDLER_CONFIG, RedisBufferHandlerConfig } from '@app/handlers/buffer/redis';

import {
  SEGMENT_DELETE_QUEUE,
  SEGMENT_UPLOADER_QUEUE,
  TRANSCODER_JOB_QUEUE,
} from '@transcoder/utils/constants';
import { TRANSCODER_PORT, TRANSCODER_STORAGE_PORT } from '@transcoder/application/ports';

import { MeasureModule } from '../measure';
import { AwsS3StorageAdapter } from '../storage/adapters';
import { SegmentWatcher } from '../transcoder/segment-watcher';
import { TranscoderConfigModule, TranscoderConfigService } from '../config';
import { TranscoderKafkaConsumerAdapter } from '../events-consumer/adapters';
import { FFmpegVideoTranscoderUploaderAdapter } from '../transcoder/adapters';
import { BullSegmentUploadWorker, BullTranscodeJobsWorker } from '../workers';
import { TranscoderKafkaPublisherAdapter } from '../events-publisher/adapters';

@Global()
@Module({
  imports: [
    MeasureModule,
    CqrsModule,
    BullModule.forRootAsync({
      imports: [TranscoderConfigModule],
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => ({
        connection: {
          url: `${configService.REDIS_HOST}:${configService.REDIS_PORT}`,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: TRANSCODER_JOB_QUEUE },
      { name: SEGMENT_UPLOADER_QUEUE },
      { name: SEGMENT_DELETE_QUEUE },
    ),
  ],
  providers: [
    // handlers
    RedisCacheHandler,
    KafkaEventConsumerHandler,
    KafkaEventPublisherHandler,

    // clients
    KafkaClient,
    RedisClient,

    // bull workers
    SegmentWatcher,
    BullTranscodeJobsWorker,
    BullSegmentUploadWorker,

    // ports and adapters
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: TranscoderKafkaPublisherAdapter,
    },
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: TranscoderKafkaConsumerAdapter,
    },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    { provide: TRANSCODER_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    {
      provide: TRANSCODER_PORT,
      useClass: FFmpegVideoTranscoderUploaderAdapter,
    },

    // configs
    // handlers configs
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'transcoder',
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
          dlqTopic: `dlq.transcoder`,
        }) satisfies KafkaEventPublisherHandlerConfig,
    },
    {
      provide: REDIS_BUFFER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'transcoder',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    {
      provide: REDIS_CACHE_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'transcoder',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'transcoder',
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
        }) satisfies KafkaEventConsumerHandlerConfig,
    },
    {
      provide: KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'transcoder',
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
        }) satisfies KafkaEventPublisherHandlerConfig,
    },

    // clients configs
    {
      provide: KAFKA_CLIENT_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          clientId: configService.KAFKA_CLIENT_ID,
          accessCert: configService.ACCESS_CERT,
          accessKey: configService.ACCESS_KEY,
          caCert: configService.KAFKA_CA_CERT,
        }) as KafkaClientConfig,
    },
    {
      provide: REDIS_CLIENT_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        }) as RedisClientConfig,
    },
    {
      provide: LOKI_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: KAFKA_BUFFER_HANDLER_CONFIG,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'transcoder',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    TranscoderConfigService,
    SegmentWatcher,
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    TranscoderConfigService,

    KafkaClient,
    RedisClient,

    RedisCacheHandler,

    SegmentWatcher,
    BullTranscodeJobsWorker,
    BullSegmentUploadWorker,
    SegmentWatcher,

    LOGGER_PORT,
    TRANSCODER_PORT,
    EVENT_CONSUMER_PORT,
    EVENT_PUBLISHER_PORT,
    TRANSCODER_STORAGE_PORT,

    REDIS_CLIENT_CONFIG,
    KAFKA_CLIENT_CONFIG,
    REDIS_CACHE_HANDLER_CONFIG,
    KAFKA_BUFFER_HANDLER_CONFIG,
    KAFKA_EVENT_CONSUMER_HANDLER_CONFIG,
    KAFKA_EVENT_PUBLISHER_HANDLER_CONFIG,

    BullModule,
  ],
})
export class PlatformModule {}
