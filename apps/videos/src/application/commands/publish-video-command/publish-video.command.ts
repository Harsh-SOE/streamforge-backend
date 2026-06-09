import { VideoCreateDto } from '@app/contracts/protocols/videos';

export class PublishVideoCommand {
  constructor(public readonly videoCreateDto: VideoCreateDto) {}
}
