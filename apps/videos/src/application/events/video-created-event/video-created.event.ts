import { TranscodeVideoEventDto } from '@app/contracts/video-transcoder';

export class VideoCreatedEvent {
  constructor(public readonly transcodeVideoMessage: TranscodeVideoEventDto) {}
}
