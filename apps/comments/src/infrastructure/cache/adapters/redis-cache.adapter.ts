import { join } from 'path';
import { readFileSync } from 'fs';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { getShardFor } from '@app/common/counters';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache/redis';

import { CommentCachePort } from '@comments/application/ports';

import { RedisWithCommands } from '../types';

@Injectable()
export class RedisCacheAdapter implements CommentCachePort, OnModuleInit {
  private readonly SHARDS = 64;
  private client: RedisWithCommands;

  public constructor(
    private readonly redisHandler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redis: RedisClient,
  ) {
    this.client = redis.getClient() as RedisWithCommands;
  }

  public onModuleInit() {
    const commentVideoScript = readFileSync(join(__dirname, 'scripts/comments.lua'), 'utf-8');

    this.client.defineCommand('commentVideo', {
      numberOfKeys: 2,
      lua: commentVideoScript,
    });

    this.logger.info('Scripts intialized');
  }

  public getShard(userId: string, videoId: string, shardNum = 64) {
    return getShardFor(userId + videoId, shardNum);
  }

  public getUserCommentedVideoSetKey(videoId: string) {
    return `video_comments_users_set:${videoId}`;
  }

  public getCommentsCountKey(videoId: string, shardNum: number) {
    return `video_comments_counter:${videoId}:${shardNum}`;
  }

  public async incrementCommentsCounter(userId: string, videoId: string): Promise<number | null> {
    const shardNum = this.getShard(userId, videoId);
    const userCommentCounterKey = this.getCommentsCountKey(videoId, shardNum);
    const userCommentSetKey = this.getUserCommentedVideoSetKey(videoId);

    const operation = async () =>
      await this.client.commentVideo(userCommentSetKey, userCommentCounterKey, userId);

    return await this.redisHandler.execute(operation, {
      key: userCommentCounterKey,
      value: '+1',
      operationType: 'WRITE',
    });
  }

  public async getTotalCommentsCounter(videoId: string): Promise<number> {
    const allShardedKeys = Array.from({ length: this.SHARDS }, (_, i) =>
      this.getCommentsCountKey(videoId, i),
    );

    const getValuesOperations = async () => await this.client.mget(...allShardedKeys);

    const values = await this.redisHandler.execute(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
    });

    const totalComments = values.reduce(
      (sum, currentValue) => sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalComments;
  }
}
