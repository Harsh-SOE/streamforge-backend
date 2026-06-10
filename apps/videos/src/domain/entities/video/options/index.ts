import {
  VideoCategories,
  VideoChannelId,
  VideoDescription,
  VideoFileIdentifier,
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
  videoThumbnailIdentifer?: VideoThumbnailFileIdentifier;
  hlsManifestIdentifier?: VideoFileIdentifier;
  state: VideoState;
  visibilityState: VideoVisibilty;
  failureReason?: string;
}

export interface CreateVideoEntityOptions {
  readonly id?: string;
  readonly userId: string;
  readonly channelId: string;
  title: string;
  videoThumbnailIdentifier?: string;
  categories: string[];
  videoFileIdentifier?: string;
  hlsManifestIdentifier?: string;
  state?: string;
  visibilityState?: string;
  description?: string;
  failureReason?: string;
}

export interface VideoSnapshot {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  videoFileIdentifier?: string;
  videoThumbnailIdentifier?: string;
  hlsManifestIdentifier?: string;
  categories: string[];
  description?: string;
  state: string;
  visibilityState: string;
  failureReason?: string;
}
