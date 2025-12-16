import { VideoTranscodedEventDto } from '@app/contracts/video-transcoder';

export class VideoTranscodedEvent {
  constructor(public readonly videoTranscodedMessage: VideoTranscodedEventDto) {}
}
