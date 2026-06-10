import { UpdateVideoHandler } from './update-video-command/update-video.handler';
import { VideoSaveDraftHandler } from './save-video-draft-command/video-save-draft.handler';

export const VideoCommandHandlers = [VideoSaveDraftHandler, UpdateVideoHandler];
