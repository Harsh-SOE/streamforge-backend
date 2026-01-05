// TODO Add handler here...
import * as fs from 'fs';
import { join } from 'path';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { getShardFor } from '@app/common/counters';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache/redis';

import { ReactionCachePort } from '@reaction/application/ports';

import { RedisWithCommands } from '../types';

@Injectable()
export class RedisCacheAdapter implements OnModuleInit, OnModuleDestroy, ReactionCachePort {
  private readonly SHARDS: number = 64;
  private client: RedisWithCommands;

  public constructor(
    private readonly handler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redis: RedisClient,
  ) {
    this.client = redis.getClient() as RedisWithCommands;
  }

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  public async onModuleInit() {
    await this.handler.execute(async () => await this.connect(), {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    const likeScript = fs.readFileSync(join(__dirname, 'scripts/like.lua'), 'utf8');

    const unlikeScript = fs.readFileSync(join(__dirname, 'scripts/unlike.lua'), 'utf8');

    const dislikeScript = fs.readFileSync(join(__dirname, 'scripts/dislike.lua'), 'utf8');

    const undislikeScript = fs.readFileSync(join(__dirname, 'scripts/undislike.lua'), 'utf8');

    this.client.defineCommand('videoLikesCountIncr', {
      numberOfKeys: 4,
      lua: likeScript,
    });

    this.client.defineCommand('videoLikesCountDecr', {
      numberOfKeys: 2,
      lua: unlikeScript,
    });

    this.client.defineCommand('videoDislikesCountIncr', {
      numberOfKeys: 4,
      lua: dislikeScript,
    });

    this.client.defineCommand('videoDislikesCountDecr', {
      numberOfKeys: 2,
      lua: undislikeScript,
    });

    this.logger.info('✅ Scripts intialized');
  }

  public async onModuleDestroy() {
    await this.handler.execute(async () => await this.disconnect(), {
      operationType: 'CONNECT_OR_DISCONNECT',
    });
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

    const getValuesOperations = async () => await this.client.mget(...allShardedKeys);

    const values = await this.handler.execute(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
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

    const getValuesOperations = async () => await this.client.mget(...allShardedKeys);

    const values = await this.handler.execute(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
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

    return await this.client.videoLikesCountIncrScriptFunction(
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

    return await this.client.videoLikesCountDecrScriptFunction(
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

    return await this.client.videoDislikesCountIncrScriptFunction(
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

    return await this.client.videoDislikesCountDecrScriptFunction(
      usersDislikedSetKey,
      videoDislikeCounterKey,
      userId,
    );
  }
}
