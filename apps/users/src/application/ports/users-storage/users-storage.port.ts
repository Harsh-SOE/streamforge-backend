export interface UsersStoragePort {
  getPresignedUrlForUserAvatar(
    userAvatarFileName: string,
    expiresIn?: number,
  ): Promise<string>;
}

export const USERS_STORAGE_PORT = Symbol('USERS_STORAGE_PORT');
