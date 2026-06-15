import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import {
  VideoProcessedIntegrationEvent,
  VideoUploadVerifiedIntegrationEvent,
} from '@app/contracts/events/videos';
import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

import { PROCESSOR_PORT, VideosProcessorPort } from '@transcoder/application/ports';

import { PROCESSING_JOB_NAME, PROCESSOR_JOB_QUEUE } from '../constants';

@Injectable()
@Processor(PROCESSOR_JOB_QUEUE, { concurrency: 1 })
export class BullMQTranscoderWorker extends WorkerHost {
  public constructor(
    @Inject(PROCESSOR_PORT) private readonly processor: VideosProcessorPort,
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly integrationEventPublisher: IntegrationEventsPublisherPort,
  ) {
    super();
  }

  public async process(job: Job<VideoUploadVerifiedIntegrationEvent>): Promise<any> {
    if (job.name !== PROCESSING_JOB_NAME) {
      return;
    }

    await job.updateProgress({
      stage: 'STARTED',
      percent: 0,
    });

    const processingResult = await this.processor.processVideo(job.data.payload.videoId);

    await job.updateProgress({
      stage: 'COMPLETED',
      percent: 100,
    });

    const videoProcessedIntegrationEvent = new VideoProcessedIntegrationEvent({
      eventId: uuidv4(),
      occurredAt: new Date().toISOString(),
      payload: processingResult,
    });

    // now the video service will know that video was processed and it will now update the state of the videos in its database.
    await this.integrationEventPublisher.publishMessage(videoProcessedIntegrationEvent);
  }
}
