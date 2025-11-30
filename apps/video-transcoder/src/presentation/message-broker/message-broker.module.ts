import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  AppConfigModule,
  AppConfigService,
} from '@transcoder/infrastructure/config';
import {
  SEGMENT_DELETE_QUEUE,
  SEGMENT_UPLOADER_QUEUE,
  TRANSCODER_JOB_QUEUE,
} from '@transcoder/utils/constants';
import {
  BullSegmentUploadWorker,
  BullTranscodeJobsWorker,
} from '@transcoder/infrastructure/workers';
import { SegmentWatcher } from '@transcoder/infrastructure/transcoder/segment-watcher/watcher';
import {
  TRANSCODER_STORAGE_PORT,
  TRANSCODER_PORT,
} from '@transcoder/application/ports';
import { WinstonLoggerAdapter } from '@transcoder/infrastructure/logger';
import { VideoTranscoderCommandHandlers } from '@transcoder/application/commands';
import { AwsS3StorageAdapter } from '@transcoder/infrastructure/storage/adapters';
import { KafkaMessageBrokerAdapter } from '@transcoder/infrastructure/message-broker/adapters';
import { FFmpegVideoTranscoderUploaderAdapter } from '@transcoder/infrastructure/transcoder/adapters';

import { VideoTranscoderService } from './message-broker.service';
import { VideoTranscoderController } from './message-broker.controller';

@Module({
  imports: [
    AppConfigModule,
    CqrsModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        connection: {
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: TRANSCODER_JOB_QUEUE },
      { name: SEGMENT_UPLOADER_QUEUE },
      { name: SEGMENT_DELETE_QUEUE },
    ),
  ],
  controllers: [VideoTranscoderController],
  providers: [
    VideoTranscoderService,
    BullTranscodeJobsWorker,
    BullSegmentUploadWorker,
    AppConfigService,
    KafkaMessageBrokerHandler,
    SegmentWatcher,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    { provide: TRANSCODER_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    {
      provide: TRANSCODER_PORT,
      useClass: FFmpegVideoTranscoderUploaderAdapter,
    },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    ...VideoTranscoderCommandHandlers,
  ],
  exports: [
    TRANSCODER_STORAGE_PORT,
    TRANSCODER_PORT,
    LOGGER_PORT,
    MESSAGE_BROKER,
  ],
})
export class VideoTranscoderModule {}
