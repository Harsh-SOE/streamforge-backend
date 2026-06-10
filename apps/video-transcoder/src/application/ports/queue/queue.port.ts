import { VideoDraftSavedIntegrationEvent } from '@app/contracts/events/videos';

export interface TranscoderQueuePort {
  enqueueTranscodeJob(payload: VideoDraftSavedIntegrationEvent): Promise<void>;
}

export const TRANSCODER_QUEUE_PORT = Symbol('TRANSCODER_QUEUE_PORT');
