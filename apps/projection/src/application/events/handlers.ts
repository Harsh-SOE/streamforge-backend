import { VideoUploadedProjectionHandler } from './video-uploaded-event/video-uploaded.handler';
import { ChannelCreatedProjectionHandler } from './channel-created-event/channel-created.handler';
import { UserProfileCreatedProjectionHandler } from './user-profile-created-event/user-profile-created.handler';
import { UserProfileUpdatedProjectionHandler } from './user-profile-updated-event/user-profile-updated.handler';

export const EventHandler = [
  VideoUploadedProjectionHandler,
  UserProfileCreatedProjectionHandler,
  ChannelCreatedProjectionHandler,
  UserProfileUpdatedProjectionHandler,
];
