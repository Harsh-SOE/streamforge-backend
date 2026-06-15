import { Module } from '@nestjs/common';

import {
  INTEGRATION_EVENT_CONSUMER_PORT,
  INTEGRATION_EVENT_PUBLISHER_PORT,
} from '@app/common/ports/events';

import { RedisCacheAdapter } from '@transcoder/infrastructure/cache/redis';
import { AwsS3StorageAdapter } from '@transcoder/infrastructure/storage/aws-s3';
import { FFmpegVideoProcessorAdapter } from '@transcoder/infrastructure/transcoder/ffmpeg';
import { TranscoderKafkaConsumerAdapter } from '@transcoder/infrastructure/integration-events-consumer/kafka';
import { TranscoderKafkaPublisherAdapter } from '@transcoder/infrastructure/integration-events-publisher/kafka';
import {
  CACHE_PORT,
  PROCESSOR_PORT,
  TRANSCODER_QUEUE_PORT,
  TRANSCODER_STORAGE_PORT,
} from '@transcoder/application/ports';
import {
  BullMQTranscoderModule,
  BullMQTranscoderQueueAdapter,
} from '@transcoder/infrastructure/queue/bullmq';

import { IntegrationEventsListenerService } from './integration-events-consumer.service';

@Module({
  imports: [BullMQTranscoderModule],
  providers: [
    IntegrationEventsListenerService,
    {
      provide: INTEGRATION_EVENT_CONSUMER_PORT,
      useClass: TranscoderKafkaConsumerAdapter,
    },
    {
      provide: INTEGRATION_EVENT_PUBLISHER_PORT,
      useClass: TranscoderKafkaPublisherAdapter,
    },
    {
      provide: TRANSCODER_QUEUE_PORT,
      useClass: BullMQTranscoderQueueAdapter,
    },
    {
      provide: PROCESSOR_PORT,
      useClass: FFmpegVideoProcessorAdapter,
    },
    {
      provide: TRANSCODER_STORAGE_PORT,
      useClass: AwsS3StorageAdapter,
    },
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
  ],
})
export class IntegrationEventsListenerModule {}
