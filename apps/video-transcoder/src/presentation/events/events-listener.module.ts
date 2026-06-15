import { Module } from '@nestjs/common';

import { EVENT_CONSUMER_PORT, EVENT_PUBLISHER_PORT } from '@app/common/ports/events';

import { RedisCacheAdapter } from '@transcoder/infrastructure/cache/redis';
import { AwsS3StorageAdapter } from '@transcoder/infrastructure/storage/aws-s3';
import { FFmpegVideoProcessorAdapter } from '@transcoder/infrastructure/transcoder/ffmpeg';
import { TranscoderKafkaConsumerAdapter } from '@transcoder/infrastructure/events-consumer/kafka';
import { TranscoderKafkaPublisherAdapter } from '@transcoder/infrastructure/events-publisher/kafka';
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

import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [BullMQTranscoderModule],
  providers: [
    EventsListenerService,
    {
      provide: EVENT_CONSUMER_PORT,
      useClass: TranscoderKafkaConsumerAdapter,
    },
    {
      provide: EVENT_PUBLISHER_PORT,
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
export class EventsListenerModule {}
