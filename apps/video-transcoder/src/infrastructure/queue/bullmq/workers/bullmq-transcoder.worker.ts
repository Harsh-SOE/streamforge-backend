import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { VideoUploadedIntegrationEvent } from '@app/contracts/events/videos';
import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';

import { TRANSCODER_JOB_NAME, TRANSCODER_JOB_QUEUE } from '../constants';

@Injectable()
@Processor(TRANSCODER_JOB_QUEUE, { concurrency: 1 })
export class BullMQTranscoderWorker extends WorkerHost {
  public constructor(@Inject(TRANSCODER_PORT) private readonly transcoder: TranscoderPort) {
    super();
  }

  public async process(job: Job<VideoUploadedIntegrationEvent>): Promise<any> {
    if (job.name !== TRANSCODER_JOB_NAME) {
      return;
    }

    await job.updateProgress({
      stage: 'STARTED',
      percent: 0,
    });

    await this.transcoder.transcodeVideo({
      videoId: job.data.payload.videoId,
      fileIdentifier: job.data.payload.newIdentifier,
    });

    await job.updateProgress({
      stage: 'COMPLETED',
      percent: 100,
    });
  }
}
