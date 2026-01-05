import { VideoReactionDto } from '@app/contracts/reaction';

export class LikeCommand {
  public constructor(public readonly videoLikeDto: VideoReactionDto) {}
}
