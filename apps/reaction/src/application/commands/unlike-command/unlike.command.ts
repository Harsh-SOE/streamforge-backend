import { VideoReactionDto } from '@app/contracts/protocols/reaction';

export class UnlikeCommand {
  public constructor(public readonly videoUnlikeDto: VideoReactionDto) {}
}
