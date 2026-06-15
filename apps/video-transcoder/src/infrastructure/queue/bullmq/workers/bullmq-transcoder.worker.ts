import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { VideoVerifiedIntegrationEvent } from '@app/contracts/events/videos';
import { PROCESSOR_PORT, VideosProcessorPort } from '@transcoder/application/ports';

import { PROCESSING_JOB_NAME, PROCESSOR_JOB_QUEUE } from '../constants';

@Injectable()
@Processor(PROCESSOR_JOB_QUEUE, { concurrency: 1 })
export class BullMQTranscoderWorker extends WorkerHost {
  public constructor(@Inject(PROCESSOR_PORT) private readonly processor: VideosProcessorPort) {
    super();
  }

  public async process(job: Job<VideoVerifiedIntegrationEvent>): Promise<any> {
    if (job.name !== PROCESSING_JOB_NAME) {
      return;
    }

    await job.updateProgress({
      stage: 'STARTED',
      percent: 0,
    });

    await this.processor.processVideo(job.data.payload.videoId);

    await job.updateProgress({
      stage: 'COMPLETED',
      percent: 100,
    });
  }
}
