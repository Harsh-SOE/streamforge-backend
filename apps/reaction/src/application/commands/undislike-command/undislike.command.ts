import { VideoReactionDto } from '@app/contracts/reaction';

export class UnDislikeCommand {
  public constructor(public readonly videoUndisikeDto: VideoReactionDto) {}
}
