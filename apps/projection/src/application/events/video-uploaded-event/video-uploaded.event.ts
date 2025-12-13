import { VideoUploadedEventDto } from '@app/contracts/videos';

export class VideoUploadedProjectionEvent {
  public constructor(public readonly videoUploadedEvent: VideoUploadedEventDto) {}
}
