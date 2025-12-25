import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

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
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';
import { LOKI_URL, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import {
  SEGMENT_DELETE_QUEUE,
  SEGMENT_UPLOADER_QUEUE,
  TRANSCODER_JOB_QUEUE,
} from '@transcoder/utils/constants';
import { TRANSCODER_PORT, TRANSCODER_STORAGE_PORT } from '@transcoder/application/ports';

import { MeasureModule } from '../measure';
import { AwsS3StorageAdapter } from '../storage/adapters';
import { TranscoderConfigModule, TranscoderConfigService } from '../config';
import { SegmentWatcher } from '../transcoder/segment-watcher';
import { KafkaMessageBrokerAdapter } from '../message-bus/adapters';
import { FFmpegVideoTranscoderUploaderAdapter } from '../transcoder/adapters';
import { BullSegmentUploadWorker, BullTranscodeJobsWorker } from '../workers';

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
    KafkaMessageBusHandler,
    KafkaClient,
    RedisClient,
    SegmentWatcher,
    BullTranscodeJobsWorker,
    BullSegmentUploadWorker,
    TranscoderConfigService,
    KafkaMessageBusHandler,
    RedisCacheHandler,
    SegmentWatcher,
    {
      provide: LOKI_URL,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.GRAFANA_LOKI_URL,
    },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    { provide: TRANSCODER_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    {
      provide: TRANSCODER_PORT,
      useClass: FFmpegVideoTranscoderUploaderAdapter,
    },
    {
      provide: KAFKA_HOST,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.KAFKA_HOST,
    },
    {
      provide: KAFKA_PORT,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.KAFKA_PORT,
    },
    {
      provide: KAFKA_CLIENT,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.KAFKA_CLIENT_ID,
    },
    {
      provide: KAFKA_CA_CERT,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.KAFKA_CA_CERT,
    },
    {
      provide: KAFKA_ACCESS_CERT,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.ACCESS_CERT,
    },
    {
      provide: KAFKA_ACCESS_KEY,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.ACCESS_KEY,
    },
    {
      provide: KAFKA_CONSUMER,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.KAFKA_CONSUMER_ID,
    },
    {
      provide: REDIS_HOST,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.REDIS_HOST,
    },
    {
      provide: REDIS_PORT,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.REDIS_PORT,
    },
    {
      provide: REDIS_STREAM_KEY,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.REDIS_STREAM_KEY,
    },
    {
      provide: REDIS_STREAM_GROUPNAME,
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => configService.REDIS_STREAM_GROUPNAME,
    },
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    TranscoderConfigService,

    KafkaClient,
    RedisClient,

    KafkaMessageBusHandler,
    RedisCacheHandler,

    SegmentWatcher,
    BullTranscodeJobsWorker,
    BullSegmentUploadWorker,
    SegmentWatcher,

    MESSAGE_BROKER,
    LOGGER_PORT,
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
    TRANSCODER_STORAGE_PORT,
    REDIS_STREAM_KEY,
    TRANSCODER_PORT,

    BullModule,
  ],
})
export class FrameworkModule {}
