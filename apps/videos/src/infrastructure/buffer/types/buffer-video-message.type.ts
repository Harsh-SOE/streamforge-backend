import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';

export type VideoMessage = {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  description: string;
  videoFileIdentifier: string;
  videoThumbnailIdentifier: string;
  videoCategories: string[];
  publishStatus: VideoDomainPublishStatus;
  visibilityStatus: VideoDomainVisibiltyStatus;
};
