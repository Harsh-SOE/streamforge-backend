import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

import { TRANSCODER_JOB, TRANSCODER_JOB_QUEUE } from '@transcoder/utils/constants';

@Injectable()
export class VideoTranscoderService {
  public constructor(@InjectQueue(TRANSCODER_JOB_QUEUE) private readonly transcodingQueue: Queue) {}

  public transcodeVideo(transcodeVideoMessage: VideoPublishedIntegrationEvent) {
    return this.transcodingQueue.add(TRANSCODER_JOB, transcodeVideoMessage.payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });
  }
}
