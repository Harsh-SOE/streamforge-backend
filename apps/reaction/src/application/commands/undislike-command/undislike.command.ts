import { VideoReactionDto } from '@app/contracts/protocols/reaction';

export class UnDislikeCommand {
  public constructor(public readonly videoUndisikeDto: VideoReactionDto) {}
}
