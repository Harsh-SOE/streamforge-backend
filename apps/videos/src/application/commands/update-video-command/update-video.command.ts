import { VideoUpdateDto } from '@app/contracts/videos';

export class UpdateVideoCommand {
  constructor(public readonly updateVideoDto: VideoUpdateDto) {}
}
