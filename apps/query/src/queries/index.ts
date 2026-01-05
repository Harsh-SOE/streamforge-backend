export * from './get-user-profile-from-id/get-user-profile-id.query';
export * from './get-user-profile-from-auth-id/get-user-profile-authid.query';
export * from './get-channel-from-id/get-channel-from-id.query';
export * from './get-channel-from-userid/get-channel-from-userid.query';

import { GetUserProfileFromAuthIdHandler } from './get-user-profile-from-auth-id/get-user-profile-authid.handler';
import { GetUserProfileFromIdHandler } from './get-user-profile-from-id/get-user-profile-id.handler';
import { GetChannelFromIdHandler } from './get-channel-from-id/get-channel-from-id.handler';
import { GetChannelFromUserIdHandler } from './get-channel-from-userid/get-channel-from-userid.handler';

export const QueryHandlers = [
  GetUserProfileFromIdHandler,
  GetUserProfileFromAuthIdHandler,
  GetChannelFromIdHandler,
  GetChannelFromUserIdHandler,
];
