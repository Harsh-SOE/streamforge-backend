// TODO add handler here...
import * as fs from 'fs';
import { join } from 'path';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { getShardFor } from '@app/common/counters';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache/redis';

import { ViewCachePort } from '@views/application/ports';

import { RedisWithCommands } from '../types';

@Injectable()
export class ViewCacheAdapter implements OnModuleInit, ViewCachePort {
  private readonly SHARDS: number = 64;
  private client: RedisWithCommands;

  public constructor(
    private readonly redisHandler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redis: RedisClient,
  ) {
    this.client = redis.getClient() as RedisWithCommands;
  }

  public onModuleInit() {
    const watchScript = fs.readFileSync(join(__dirname, 'scripts/watch.lua'), 'utf8');

    this.client.defineCommand('watchVideoCounterIncr', {
      numberOfKeys: 2,
      lua: watchScript,
    });

    this.logger.info('Scripts intialized');
  }

  getShardKey(videoId: string, userId: string, shard: number = 64) {
    return getShardFor(videoId + userId, shard);
  }

  getViewsCounterKey(videoId: string, shardNum: number) {
    return `videoWatchCounterKey:${videoId}:${shardNum}`;
  }

  getUserViewsSetKey(videoId: string) {
    return `videoWatchedByUserSetKey:${videoId}`;
  }

  public async getTotalViews(videoId: string): Promise<number> {
    const allShardedKeys = Array.from({ length: this.SHARDS }, (_, i) =>
      this.getViewsCounterKey(videoId, i),
    );

    const getValuesOperations = async () => await this.client.mget(...allShardedKeys);

    const values = await this.redisHandler.execute(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
    });

    const totalViews = values.reduce(
      (sum, currentValue) => sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalViews;
  }

  public async recordView(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersViewsSetKey = this.getUserViewsSetKey(videoId);
    const videoViewsCounterKey = this.getViewsCounterKey(videoId, shardNum);

    return await this.client.watchVideoCounterIncr(usersViewsSetKey, videoViewsCounterKey, userId);
  }
}
