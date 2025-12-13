import { VideoRequestPublishStatus, VideoRequestVisibilityStatus } from '../enums';

export class FoundVideoRequestResponse {
  id: string;
  title: string;
  videoFileIdentifier: string;
  description?: string | undefined;
  thumbnail: string;
  categories: string[];
  videoPublishStatus: VideoRequestPublishStatus;
  videoVisibilityStatus: VideoRequestVisibilityStatus;
}
