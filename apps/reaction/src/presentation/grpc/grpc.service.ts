import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  ReactedOnVideoDto,
  ReactionDislikeCountVideoDto,
  ReactionDislikeCountVideoResponse,
  ReactionFoundForVideoResponse,
  ReactionLikeCountVideoDto,
  ReactionLikeCountVideoResponse,
  ReactionResponse,
  ReactionType,
  VideoReactionDto,
} from '@app/contracts/reaction';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  DislikeCommand,
  LikeCommand,
  UnDislikeCommand,
  UnlikeCommand,
} from '@reaction/application/commands';
import { GetDislikesVideoQuery, GetLikesVideoQuery } from '@reaction/application/queries';

@Injectable()
export class GrpcService {
  public static readonly SHARDS = 64;

  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  public async getLikesCountForVideo(
    reactionLikeCountVideoDto: ReactionLikeCountVideoDto,
  ): Promise<ReactionLikeCountVideoResponse> {
    return await this.queryBus.execute<GetLikesVideoQuery, ReactionLikeCountVideoResponse>(
      new GetLikesVideoQuery(reactionLikeCountVideoDto),
    );
  }

  async getDislikesCountForVideo(
    reactionDislikeCountVideoDto: ReactionDislikeCountVideoDto,
  ): Promise<ReactionDislikeCountVideoResponse> {
    return await this.queryBus.execute<GetDislikesVideoQuery, ReactionDislikeCountVideoResponse>(
      new GetDislikesVideoQuery(reactionDislikeCountVideoDto),
    );
  }

  async findReactionOfUserOnVideo(
    reactedOnVideoDto: ReactedOnVideoDto,
  ): Promise<ReactionFoundForVideoResponse> {
    const { userId, videoId } = reactedOnVideoDto;
    await Promise.resolve(null);

    // delegate to aggregaor service for querying the like
    return { id: 'random-id', reaction: 0, userId, videoId };
  }
}
