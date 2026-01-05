import { VideoCreateDto } from '@app/contracts/videos';

export class PublishVideoCommand {
  constructor(public readonly videoCreateDto: VideoCreateDto) {}
}
