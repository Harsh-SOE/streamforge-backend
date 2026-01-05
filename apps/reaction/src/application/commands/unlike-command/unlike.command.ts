import { VideoReactionDto } from '@app/contracts/reaction';

export class UnlikeCommand {
  public constructor(public readonly videoUnlikeDto: VideoReactionDto) {}
}
