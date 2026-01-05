import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { TranscodeVideoEventDto } from '@app/contracts/video-transcoder';

import { TRANSCODER_JOB_QUEUE } from '@transcoder/utils/constants';
import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';

@Injectable()
@Processor(TRANSCODER_JOB_QUEUE)
export class BullTranscodeJobsWorker extends WorkerHost {
  constructor(
    @Inject(TRANSCODER_PORT)
    private readonly transcoder: TranscoderPort,
  ) {
    super();
  }

  async process(job: Job<TranscodeVideoEventDto>): Promise<void> {
    return await this.transcoder.transcodeVideo(job.data);
  }
}
