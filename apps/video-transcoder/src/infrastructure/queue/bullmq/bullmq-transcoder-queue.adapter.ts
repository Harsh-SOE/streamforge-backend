import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { ProcessorQueuePort } from '@transcoder/application/ports';
import { VideoUploadVerifiedIntegrationEvent } from '@app/contracts/events/videos';

import { PROCESSING_JOB_NAME, PROCESSOR_JOB_QUEUE } from './constants';

@Injectable()
export class BullMQTranscoderQueueAdapter implements ProcessorQueuePort {
  public constructor(@InjectQueue(PROCESSOR_JOB_QUEUE) private readonly queue: Queue) {}

  public async enqueueProcessingJob(
    transcodeVideoMessage: VideoUploadVerifiedIntegrationEvent,
  ): Promise<void> {
    await this.queue.add(PROCESSING_JOB_NAME, transcodeVideoMessage, {
      jobId: transcodeVideoMessage.payload.videoId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: {
        age: 60 * 60,
        count: 1000,
      },
      removeOnFail: false,
    });
  }
}
