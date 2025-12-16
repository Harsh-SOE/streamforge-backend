import { GetUserProfileFromAuthIdHandler } from './get-user-profile-from-auth-id/get-user-profile-authid.handler';
import { GetUserProfileFromIdHandler } from './get-user-profile-from-id/get-user-profile-id.handler';
import { GetChannelFromIdHandler } from './get-channel-from-id/get-channel-from-id.handler';

export const QueryHandlers = [
  GetUserProfileFromIdHandler,
  GetUserProfileFromAuthIdHandler,
  GetChannelFromIdHandler,
];
