export interface ChannelStoragePort {
  getPresignedUrlForChannelCoverImage(
    channelCoverImageFileName: string,
    expiresIn?: number,
  ): Promise<{ fileIdentifier: string; presignedUrl: string }>;
}

export const CHANNEL_STORAGE_PORT = Symbol('CHANNEL_STORAGE_PORT');
