import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import * as fs from 'fs';
import { join } from 'path';

import { getShardFor } from '@app/counters';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

import { ViewCachePort } from '@views/application/ports';
import { AppConfigService } from '@views/infrastructure/config';

import { RedisWithCommands } from '../types';

@Injectable()
export class ViewCacheAdapter
  implements OnModuleInit, OnModuleDestroy, ViewCachePort
{
  private readonly SHARDS: number = 64;
  private redisClient: RedisWithCommands;

  public constructor(
    private readonly configService: AppConfigService,
    private readonly redisfilter: RedisCacheHandler,
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
    const watchScript = fs.readFileSync(
      join(__dirname, 'scripts/watch.lua'),
      'utf8',
    );

    this.redisClient.defineCommand('watchVideoCounterIncr', {
      numberOfKeys: 2,
      lua: watchScript,
    });

    this.logger.info('✅ Scripts intialized');
  }

  public onModuleDestroy() {
    this.redisClient.disconnect();
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

    const getValuesOperations = async () =>
      await this.redisClient.mget(...allShardedKeys);

    const values = await this.redisfilter.filter(getValuesOperations, {
      operationType: 'READ_MANY',
      keys: allShardedKeys,
      logErrors: true,
      suppressErrors: false,
    });

    const totalViews = values.reduce(
      (sum, currentValue) =>
        sum + (currentValue ? parseInt(currentValue, 10) : 0),
      0,
    );

    return totalViews;
  }

  public async recordView(videoId: string, userId: string): Promise<number> {
    const shardNum = this.getShardKey(videoId, userId);
    const usersViewsSetKey = this.getUserViewsSetKey(videoId);
    const videoViewsCounterKey = this.getViewsCounterKey(videoId, shardNum);

    return await this.redisClient.watchVideoCounterIncr(
      usersViewsSetKey,
      videoViewsCounterKey,
      userId,
    );
  }
}
