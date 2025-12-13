import { GetUserProfileFromAuthIdHandler } from './get-user-profile-from-auth-id/get-user-profile-authid.handler';
import { GetUserProfileFromIdHandler } from './get-user-profile-from-id/get-user-profile-id.handler';

export const QueryHandlers = [GetUserProfileFromIdHandler, GetUserProfileFromAuthIdHandler];

export * from './get-user-profile-from-id/get-user-profile-id.query';
export * from './get-user-profile-from-id/get-user-profile-id.handler';
export * from './get-user-profile-from-auth-id/get-user-profile-authid.handler';
export * from './get-user-profile-from-auth-id/get-user-profile-authid.query';
