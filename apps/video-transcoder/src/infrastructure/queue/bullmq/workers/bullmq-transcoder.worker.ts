import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { TranscodeVideoEventDto } from '@app/contracts/video-transcoder';

import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';

import { TRANSCODER_JOB_NAME, TRANSCODER_JOB_QUEUE } from '../constants';

@Injectable()
@Processor(TRANSCODER_JOB_QUEUE, { concurrency: 1 })
export class BullMQTranscoderWorker extends WorkerHost {
  public constructor(@Inject(TRANSCODER_PORT) private readonly transcoder: TranscoderPort) {
    super();
  }

  public async process(job: Job<TranscodeVideoEventDto>): Promise<any> {
    if (job.name !== TRANSCODER_JOB_NAME) {
      return;
    }

    await job.updateProgress({
      stage: 'STARTED',
      percent: 0,
    });

    await this.transcoder.transcodeVideo(job.data);

    await job.updateProgress({
      stage: 'COMPLETED',
      percent: 100,
    });
  }
}
