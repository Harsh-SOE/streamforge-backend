import { VideoPublishedEventHandler } from './video-published.handler';
import { VideoTranscodedEventHandler } from './video-transcoded.handler';

export const VideoEventHandler = [VideoPublishedEventHandler, VideoTranscodedEventHandler];
