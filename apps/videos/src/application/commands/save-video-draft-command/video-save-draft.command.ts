import { SaveVideoDraftDto } from '@app/contracts/protocols/videos';

export class VideoSaveDraftCommand {
  constructor(public readonly videoSaveDraftDto: SaveVideoDraftDto) {}
}
