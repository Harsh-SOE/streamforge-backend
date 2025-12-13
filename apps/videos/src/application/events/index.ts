import { VideoCreatedEventHandler } from './video-created-event';
import { VideoTranscodedEventHandler } from './video-transcoded-event';

export const VideoEventHandler = [VideoCreatedEventHandler, VideoTranscodedEventHandler];

export * from './video-created-event';
export * from './video-transcoded-event';
