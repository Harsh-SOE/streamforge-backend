import { VideoVerifiedIntegrationEvent } from '@app/contracts/events/videos';

export interface ProcessorQueuePort {
  enqueueProcessingJob(payload: VideoVerifiedIntegrationEvent): Promise<void>;
}

export const TRANSCODER_QUEUE_PORT = Symbol('TRANSCODER_QUEUE_PORT');
