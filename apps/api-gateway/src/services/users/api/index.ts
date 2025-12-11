export enum USER_API {
  ROUTE = 'user',
  PRESIGNED_URL_AVATAR = 'avatar/presign',
  COMPLETE_PROFILE = 'profile/complete',
  UPDATE_DETAILS = 'profile/details',
  DELETE_USER = 'me/unregister',
  GET_CURRENTLY_LOGGED_IN_USER = 'me',
  GET_ALL_USERS = '',
}
export enum USER_API_VERSION {
  V1 = '1',
  V2 = '2',
}
