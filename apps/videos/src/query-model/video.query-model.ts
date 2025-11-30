import { VideoQueryPublishStatus } from './enums/video-query-publish-status.enum';
import { VideoQueryVisibiltyStatus } from './enums/video-query-visibility-status.enum';

export interface VideoProps {
  readonly id: string;
  readonly ownerId: string;
  readonly channelId: string;
  readonly title: string;
  readonly videoThumbnailIdentifier: string;
  readonly videoFileIdentifier: string;
  readonly categories: string[];
  readonly videoPublishStatus: VideoQueryPublishStatus;
  readonly videoVisibilityStatus: VideoQueryVisibiltyStatus;
  readonly description?: string | undefined;
}

export class VideoQueryModel {
  constructor(public readonly videoProps: VideoProps) {}
}
