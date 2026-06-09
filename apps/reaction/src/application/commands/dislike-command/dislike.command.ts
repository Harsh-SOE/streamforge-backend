import { VideoReactionDto } from '@app/contracts/protocols/reaction';

export class DislikeCommand {
  public constructor(public readonly videoDislikeDto: VideoReactionDto) {}
}
