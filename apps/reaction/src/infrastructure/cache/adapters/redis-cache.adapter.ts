import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as fs from 'fs';
import { join } from 'path';

import { getShardFor } from '@app/counters';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { ReactionCachePort } from '@reaction/application/ports';
import { AppConfigService } from '@reaction/infrastructure/config';

import { RedisWithCommands } from '../types';

@Injectable()
export class RedisCacheAdapter implements OnModuleInit, OnModuleDestroy, ReactionCachePort {
  private readonly SHARDS: number = 64;
  private redisClient: RedisWithCommands;

  public constructor(
    private readonly configService: AppConfigService,
    private readonly redisCacheHandler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.redisClient = new Redis({
      host: configService.CACHE_HOST,
      port: configService.CACHE_PORT,
    }) as RedisWithCommands;

    this.redisClient.on('connecting', () => {
      this.logger.info('⏳ Redis connecting...');
    });
    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis connected');
    });
    this.redisClient.on('error', (error) => {
      this.logger.error('❌ An Error occured in redis cache', error);
    });
  }

  public onModuleInit() {
    const likeScript = fs.readFileSync(join(__dirname, 'scripts/like.lua'), 'utf8');

    const unlikeScript = fs.readFileSync(join(__dirname, 'scripts/unlike.lua'), 'utf8');

    const dislikeScript = fs.readFileSync(join(__dirname, 'scripts/dislike.lua'), 'utf8');

    const undislikeScript = fs.readFileSync(join(__dirname, 'scripts/undislike.lua'), 'utf8');

    this.redisClient.defineCommand('videoLikesCountIncr', {
      numberOfKeys: 4,
      lua: likeScript,
    });

    this.redisClient.defineCommand('videoLikesCountDecr', {
      numberOfKeys: 2,
      lua: unlikeScript,
    });

    this.redisClient.defineCommand('videoDislikesCountIncr', {
      numberOfKeys: 4,
      lua: dislikeScript,
    });

    this.redisClient.defineCommand('videoDislikesCountDecr', {
      numberOfKeys: 2,
      lua: undislikeScript,
    });

    this.logger.info('✅ Scripts intialized');
  }

  public onModuleDestroy() {
    this.redisClient.disconnect();
  }

  getShardKey(videoId: string, userId: string, shard: number = 64) {
    return getShardFor(videoId + userId, shard);
  }

  getVideoLikesCounterKey(videoId: string, shardNum: number) {
    return `videoLikesCounter:${videoId}:${shardNum}`;
  }

  getVideoDislikeCounterKey(videoId: string, shardNum: number) {
    return `videoDislikesCounter:${videoId}:${shardNum}`;
  }

  getUserLikesSetKey(videoId: string) {
    return `videoLikedByUsers:${videoId}`;
  }

  getUserDislikesSetKey(videoId: string) {
    return `videoDislikedByUsers:${videoId}`;
  }

  public async getTotalLikes(videoId: string): Promise<number> {
    const allShardedKeys = Array.from({ length: this.SHARDS }, (_, i) =>
      this.getVideoLikesCounterKey(videoId, i),
    );

    const getValuesOperations = async () => await this.redisClient.mget(...allShardedKeys);

    const values = await this.redisCacheHandler.filter(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
      logErrors: true,
      suppressErrors: false,
    });

    const totalLikes = values.reduce(
      (sum, currentValue) => sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalLikes;
  }

  public async getTotalDislikes(videoId: string): Promise<number> {
    const allShardedKeys = Array.from({ length: this.SHARDS }, (_, i) =>
      this.getVideoDislikeCounterKey(videoId, i),
    );

    const getValuesOperations = async () => await this.redisClient.mget(...allShardedKeys);

    const values = await this.redisCacheHandler.filter(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
      logErrors: true,
      suppressErrors: false,
    });

    const totalDislikes = values.reduce(
      (sum, currentValue) => sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalDislikes;
  }

  public async recordLike(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersDislikedSetKey = this.getUserDislikesSetKey(videoId);
    const usersLikedSetKey = this.getUserLikesSetKey(videoId);
    const videoDislikeCounterKey = this.getVideoDislikeCounterKey(videoId, shardNum);
    const videoLikeCounterKey = this.getVideoLikesCounterKey(videoId, shardNum);

    return await this.redisClient.videoLikesCountIncrScriptFunction(
      usersLikedSetKey,
      usersDislikedSetKey,
      videoLikeCounterKey,
      videoDislikeCounterKey,
      userId,
    );
  }

  public async removeLike(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersLikedSetKey = this.getUserLikesSetKey(videoId);
    const videoLikeCounterKey = this.getVideoLikesCounterKey(videoId, shardNum);

    return await this.redisClient.videoLikesCountDecrScriptFunction(
      usersLikedSetKey,
      videoLikeCounterKey,
      userId,
    );
  }

  public async recordDislike(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersDislikedSetKey = this.getUserDislikesSetKey(videoId);
    const usersLikedSetKey = this.getUserLikesSetKey(videoId);
    const videoDislikeCounterKey = this.getVideoDislikeCounterKey(videoId, shardNum);
    const videoLikeCounterKey = this.getVideoLikesCounterKey(videoId, shardNum);

    return await this.redisClient.videoDislikesCountIncrScriptFunction(
      usersDislikedSetKey,
      usersLikedSetKey,
      videoDislikeCounterKey,
      videoLikeCounterKey,
      userId,
    );
  }

  public async removeDislike(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersDislikedSetKey = this.getUserDislikesSetKey(videoId);
    const videoDislikeCounterKey = this.getVideoDislikeCounterKey(videoId, shardNum);

    return await this.redisClient.videoDislikesCountDecrScriptFunction(
      usersDislikedSetKey,
      videoDislikeCounterKey,
      userId,
    );
  }
}
