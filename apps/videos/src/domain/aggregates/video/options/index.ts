import { DomainVideoVisibiltyState } from '@videos/domain/enums';

export interface CreateVideoFromDraftOptions {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  description?: string;
  categories: string[];
}

export interface VideoSnapshotOptions {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  description?: string;
  categories: string[];

  state: string;
  visibilityState: string;

  videoFileIdentifier?: string;
  videoThumbnailIdentifier?: string;
  hlsManifestIdentifier?: string;

  durationSeconds?: number;
  width?: number;
  height?: number;
  sizeBytes?: bigint;
  mimeType?: string;

  failureReason?: string;

  uploadedAt?: Date;
  processingStartedAt?: Date;
  transcodedAt?: Date;
  publishedAt?: Date;
}

export interface UpdateVideoDetails {
  title?: string;
  description?: string;
  categories?: string[];
  visibilityState?: DomainVideoVisibiltyState;
}

export interface CompleteVideoUploadOptions {
  videoFileIdentifier: string;
  videoThumbnailIdentifier: string;
}

export interface MarkVideoTranscodedOptions {
  hlsManifestIdentifier: string;
  durationSeconds: number;
  width: number;
  height: number;
  sizeBytes: bigint;
  mimeType: string;
}

export interface FailVideoProcessingOptions {
  reason: string;
}
