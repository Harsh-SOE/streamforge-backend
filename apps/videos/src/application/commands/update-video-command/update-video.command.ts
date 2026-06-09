import { VideoUpdateDto } from '@app/contracts/protocols/videos';

export class UpdateVideoCommand {
  constructor(public readonly updateVideoDto: VideoUpdateDto) {}
}
