export interface VideoAggregateOptions {
  id?: string;
  userId: string;
  channelId: string;
  title: string;
  videoThumbnailIdentifier: string;
  videoFileIdentifier: string;
  categories: string[];
  description?: string;
  publishStatus: string;
  visibilityStatus: string;
}
