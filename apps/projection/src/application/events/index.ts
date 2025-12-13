import { VideoUploadedProjectionHandler } from './video-uploaded-event/video-uploaded.handler';
import { UserProfileCreatedProjectionHandler } from './user-profile-created-event/user-profile-created.handler';

export const EventHandler = [VideoUploadedProjectionHandler, UserProfileCreatedProjectionHandler];

export * from './video-uploaded-event/video-uploaded.event';
export * from './video-uploaded-event/video-uploaded.handler';
export * from './user-profile-created-event/user-profile-created.event';
export * from './user-profile-created-event/user-profile-created.handler';
