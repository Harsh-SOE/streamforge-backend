import { VideoDraftSavedEventHandler } from './video-draft-saved.handler';
import { VideoUploadVerifiedHandler } from './video-upload-verified.handler';

export const VideosDomainEventsHandler = [VideoDraftSavedEventHandler, VideoUploadVerifiedHandler];
