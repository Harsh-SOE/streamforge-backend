import { VideoSaveDraftDto } from '@app/contracts/protocols/videos';

export class VideoSaveDraftCommand {
  constructor(public readonly videoSaveDraftDto: VideoSaveDraftDto) {}
}
