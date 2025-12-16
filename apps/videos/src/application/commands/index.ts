import { UpdateVideoHandler } from './update-video-command/update-video.handler';
import { PublishVideoHandler } from './publish-video-command/publish-video.handler';
import { GeneratePreSignedUrlVideoHandler } from './generate-presigned-url-video-command/generate-presigned-url-video.handler';
import { GeneratePreSignedUrlThumbnailHandler } from './generate-presigned-url-thumbnail-command/generate-presigned-url-thumbnail.handler';

export const VideoCommandHandlers = [
  PublishVideoHandler,
  UpdateVideoHandler,
  GeneratePreSignedUrlVideoHandler,
  GeneratePreSignedUrlThumbnailHandler,
];
