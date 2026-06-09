import { VideoReactionDto } from '@app/contracts/protocols/reaction';

export class LikeCommand {
  public constructor(public readonly videoLikeDto: VideoReactionDto) {}
}
