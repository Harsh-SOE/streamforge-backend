import { UpdateVideoHandler } from './update-video-command/update-video.handler';
import { VideoSaveDraftHandler } from './save-video-draft-command/video-save-draft.handler';
import { VerifyUploadedMediaHandler } from './verify-uploaded-media-command/verify-uploaded-media.handler';

export const VideoCommandHandlers = [
  VideoSaveDraftHandler,
  UpdateVideoHandler,
  VerifyUploadedMediaHandler,
];
