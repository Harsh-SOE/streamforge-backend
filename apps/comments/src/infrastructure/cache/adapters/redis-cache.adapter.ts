import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { readFileSync } from 'fs';
import { join } from 'path';

import { getShardFor } from '@app/counters';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

import { CommentCachePort } from '@comments/application/ports';
import { AppConfigService } from '@comments/infrastructure/config';

import { RedisWithCommands } from '../types';

@Injectable()
export class RedisCacheAdapter implements CommentCachePort, OnModuleInit {
  private readonly SHARDS = 64;
  private redisClient: RedisWithCommands;

  public constructor(
    private readonly configService: AppConfigService,
    private readonly redisHandler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.redisClient = new Redis({
      host: configService.CACHE_HOST,
      port: configService.CACHE_PORT,
    }) as RedisWithCommands;

    this.redisClient.on('connecting', () => {
      this.logger.info(`⏳ Redis connecting...`);
    });

    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('❌ An Error occured in redis cache', error);
    });
  }

  public onModuleInit() {
    const commentVideoScript = readFileSync(join(__dirname, 'scripts/comments.lua'), 'utf-8');

    this.redisClient.defineCommand('commentVideo', {
      numberOfKeys: 2,
      lua: commentVideoScript,
    });

    this.logger.info('✅ Scripts intialized');
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
      await this.redisClient.commentVideo(userCommentSetKey, userCommentCounterKey, userId);

    return await this.redisHandler.filter(operation, {
      key: userCommentCounterKey,
      value: '+1',
      operationType: 'WRITE',
      logErrors: true,
      suppressErrors: false,
    });
  }

  public async getTotalCommentsCounter(videoId: string): Promise<number> {
    const allShardedKeys = Array.from({ length: this.SHARDS }, (_, i) =>
      this.getCommentsCountKey(videoId, i),
    );

    const getValuesOperations = async () => await this.redisClient.mget(...allShardedKeys);

    const values = await this.redisHandler.filter(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
      logErrors: true,
      suppressErrors: false,
    });

    const totalComments = values.reduce(
      (sum, currentValue) => sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalComments;
  }
}
