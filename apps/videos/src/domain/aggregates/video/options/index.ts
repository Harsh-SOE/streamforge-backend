export interface VideoAggregateOptions {
  id?: string;
  ownerId: string;
  channelId: string;
  title: string;
  videoThumbnailIdentifier: string;
  videoFileIdentifier: string;
  categories: string[];
  description?: string;
  publishStatus: string;
  visibilityStatus: string;
}
