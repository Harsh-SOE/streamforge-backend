export interface VideoBufferMessagePayload {
  id: string;
  ownerId: string;
  channelId: string;
  title: string;
  description?: string;
  videoCategories: string[];
  state: string;
  videoFileIdentifier?: string;
  videoThumbnailIdentifier?: string;
  visibilityState: string;
  hlsManifestKey?: string;
  failureReason?: string;
}
