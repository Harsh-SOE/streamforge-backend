import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { TranscodeVideoMessage } from '@app/contracts/video-transcoder';

import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';
import { TRANSCODER_JOB_QUEUE } from '@transcoder/utils/constants';

@Injectable()
@Processor(TRANSCODER_JOB_QUEUE)
export class BullTranscodeJobsWorker extends WorkerHost {
  constructor(@Inject(TRANSCODER_PORT) private readonly transcoder: TranscoderPort) {
    super();
  }

  async process(job: Job<TranscodeVideoMessage>): Promise<void> {
    return await this.transcoder.transcodeVideo(job.data);
  }
}
