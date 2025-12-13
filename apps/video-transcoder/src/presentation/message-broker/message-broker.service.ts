import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { TranscodeVideoMessage } from '@app/contracts/video-transcoder';

import { TRANSCODER_JOB, TRANSCODER_JOB_QUEUE } from '@transcoder/utils/constants';

@Injectable()
export class VideoTranscoderService {
  public constructor(@InjectQueue(TRANSCODER_JOB_QUEUE) private readonly transcodingQueue: Queue) {}

  public transcodeVideo(transcodeVideoMessage: TranscodeVideoMessage) {
    return this.transcodingQueue.add(TRANSCODER_JOB, transcodeVideoMessage, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });
  }
}
