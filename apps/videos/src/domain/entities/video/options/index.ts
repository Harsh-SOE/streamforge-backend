import {
  HlsManifestIdentifier,
  VideoCategories,
  VideoChannelId,
  VideoDescription,
  VideoFileDurationInSeconds,
  VideoFileHeight,
  VideoFileIdentifier,
  VideoFileMimetype,
  VideoFileSizeBytes,
  VideoFileWidth,
  VideoId,
  VideoOwnerId,
  VideoState,
  VideoThumbnailFileIdentifier,
  VideoTitle,
  VideoVisibilty,
} from '@videos/domain/value-objects';

export interface VideoProps {
  readonly id: VideoId;
  readonly ownerId: VideoOwnerId;
  readonly channelId: VideoChannelId;

  title: VideoTitle;
  categories: VideoCategories;
  description?: VideoDescription;

  videoFileIdentifier?: VideoFileIdentifier;
  videoThumbnailIdentifier?: VideoThumbnailFileIdentifier;
  hlsManifestIdentifier?: HlsManifestIdentifier;

  state: VideoState;
  visibilityState: VideoVisibilty;

  durationSeconds?: VideoFileDurationInSeconds;
  width?: VideoFileWidth;
  height?: VideoFileHeight;
  sizeBytes?: VideoFileSizeBytes;
  mimeType?: VideoFileMimetype;
  failureReason?: string;

  uploadedAt?: Date;
  processingStartedAt?: Date;
  transcodedAt?: Date;
  publishedAt?: Date;
}

export interface CreateVideoEntityOptions {
  readonly id?: string;
  readonly ownerId: string;
  readonly channelId: string;

  title: string;
  categories: Array<string>;
  description?: string;

  videoFileIdentifier?: string;
  videoThumbnailIdentifier?: string;
  hlsManifestIdentifier?: string;

  state?: string;
  visibilityState?: string;

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

export interface VideoSnapshot {
  id: string;
  ownerId: string;
  channelId: string;

  title: string;
  categories: string[];
  description?: string;

  videoFileIdentifier?: string;
  videoThumbnailIdentifier?: string;
  hlsManifestIdentifier?: string;

  state: string;
  visibilityState: string;

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
