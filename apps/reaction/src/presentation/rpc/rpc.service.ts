import { CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { ReactionResponse, ReactionType, VideoReactionDto } from '@app/contracts/reaction';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  DislikeCommand,
  LikeCommand,
  UnDislikeCommand,
  UnlikeCommand,
} from '@reaction/application/commands';

@Injectable()
export class RpcService {
  public static readonly SHARDS = 64;

  public constructor(
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async reactToVideo(videoReactionDto: VideoReactionDto): Promise<ReactionResponse> {
    const { reaction } = videoReactionDto;

    switch (true) {
      case reaction === ReactionType.REACTION_LIKE: {
        return this.commandBus.execute<LikeCommand, ReactionResponse>(
          new LikeCommand(videoReactionDto),
        );
      }
      case reaction === ReactionType.REACTION_UNLIKE: {
        return this.commandBus.execute<UnlikeCommand, ReactionResponse>(
          new UnlikeCommand(videoReactionDto),
        );
      }
      case reaction === ReactionType.REACTION_DISLIKE: {
        return this.commandBus.execute<DislikeCommand, ReactionResponse>(
          new DislikeCommand(videoReactionDto),
        );
      }
      case reaction === ReactionType.REACTION_UNDISLIKE: {
        return this.commandBus.execute<UnDislikeCommand, ReactionResponse>(
          new UnDislikeCommand(videoReactionDto),
        );
      }
      default: {
        return { response: 'invalid like status was provided' };
      }
    }
  }
}
