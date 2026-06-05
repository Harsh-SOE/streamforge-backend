import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

export interface TranscoderQueuePort {
  enqueueTranscodeJob(payload: VideoPublishedIntegrationEvent): Promise<void>;
}

export const TRANSCODER_QUEUE_PORT = Symbol('TRANSCODER_QUEUE_PORT');
