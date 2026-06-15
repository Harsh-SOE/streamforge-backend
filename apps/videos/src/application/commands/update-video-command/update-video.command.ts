import { UpdateVideoDto } from '@app/contracts/protocols/videos';

export class UpdateVideoCommand {
  constructor(public readonly updateVideoDto: UpdateVideoDto) {}
}
