import { VideoDraftSavedEventHandler } from './video-draft-saved.handler';
import { VideoStartTranscodingHandler } from './video-start-transcoding.handler';

export const VideosEventsHandler = [VideoDraftSavedEventHandler, VideoStartTranscodingHandler];
