export interface CreateVideoDraftAggregateOptions {
  id?: string;
  userId: string;
  channelId: string;
  title: string;
  categories: string[];
  description?: string;
  videoThumbnailIdentifier?: string;
  videoFileIdentifier?: string;
  hlsManifestIdentifier?: string;
  state?: string;
  visibilityState?: string;
}

export interface RehydrateVideoAggregateOptions extends CreateVideoDraftAggregateOptions {
  videoThumbnailIdentifier?: string;
  videoFileIdentifier?: string;
  hlsManifestIdentifier?: string;
  state?: string;
  failureReason?: string;
}
