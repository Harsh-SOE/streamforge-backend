import { VideoReactionDto } from '@app/contracts/reaction';

export class DislikeCommand {
  public constructor(public readonly videoDislikeDto: VideoReactionDto) {}
}
