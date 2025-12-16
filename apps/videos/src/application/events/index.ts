import { VideoCreatedEventHandler } from './video-created-event/video-created.handler';
import { VideoTranscodedEventHandler } from './video-transcoded-event/video-transcoded.handler';

export const VideoEventHandler = [VideoCreatedEventHandler, VideoTranscodedEventHandler];
