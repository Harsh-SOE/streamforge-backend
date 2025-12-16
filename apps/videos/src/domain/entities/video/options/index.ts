import {
  VideoCategories,
  VideoChannelId,
  VideoDescription,
  VideoFileIdentifier,
  VideoId,
  VideoOwnerId,
  VideoPublish,
  VideoThumbnailFileIdentifier,
  VideoTitle,
  VideoVisibilty,
} from '@videos/domain/value-objects';

export interface VideoProps {
  readonly id: VideoId;
  readonly ownerId: VideoOwnerId;
  readonly channelId: VideoChannelId;
  title: VideoTitle;
  videoThumbnailIdentifer: VideoThumbnailFileIdentifier;
  categories: VideoCategories;
  videoFileIdentifier: VideoFileIdentifier;
  publishStatus: VideoPublish;
  visibilityStatus: VideoVisibilty;
  description?: VideoDescription;
}

export interface CreateVideoEntityOptions {
  readonly id?: string;
  readonly ownerId: string;
  readonly channelId: string;
  title: string;
  videoThumbnailIdentifier: string;
  categories: Array<string>;
  videoFileIdentifier: string;
  publishStatus: string;
  visibilityStatus: string;
  description?: string;
}

export interface VideoSnapshot {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  videoFileIdentifier: string;
  videoThumbnailIdentifier: string;
  categories: Array<string>;
  description?: string;
  publishStatus: string;
  visibilityStatus: string;
}
