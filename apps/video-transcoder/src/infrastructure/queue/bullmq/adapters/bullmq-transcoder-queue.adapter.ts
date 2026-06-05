import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

import { TranscoderQueuePort } from '@transcoder/application/ports/queue';

import { TRANSCODER_JOB_NAME, TRANSCODER_JOB_QUEUE } from '../constants';

@Injectable()
export class BullMQTranscoderQueueAdapter implements TranscoderQueuePort {
  public constructor(@InjectQueue(TRANSCODER_JOB_QUEUE) private readonly queue: Queue) {}

  public async enqueueTranscodeJob(
    transcodeVideoMessage: VideoPublishedIntegrationEvent,
  ): Promise<void> {
    await this.queue.add(TRANSCODER_JOB_NAME, transcodeVideoMessage, {
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
