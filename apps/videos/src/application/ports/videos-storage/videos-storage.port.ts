export interface VideosStoragePort {
  getPresignedUrlForVideo(
    filePathKey: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }>;

  getPresignedUrlForThumbnail(
    filePathKey: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
