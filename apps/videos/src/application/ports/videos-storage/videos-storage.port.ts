export interface VideosStoragePort {
  getPresignedUrlForVideo(videoId: string, expiresIn?: number): Promise<{ presignedUrl: string }>;

  getPresignedUrlForThumbnail(
    videoId: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string }>;

  verifyRawMedia(videoId: string): Promise<{ exists: boolean }>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
