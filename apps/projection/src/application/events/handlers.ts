import { VideoUploadedProjectionHandler } from './video-uploaded-event/video-uploaded.handler';
import { UserProfileCreatedProjectionHandler } from './user-profile-created-event/user-profile-created.handler';
import { ChannelCreatedProjectionHandler } from './channel-created-event/channel-created.handler';

export const EventHandler = [
  VideoUploadedProjectionHandler,
  UserProfileCreatedProjectionHandler,
  ChannelCreatedProjectionHandler,
];
