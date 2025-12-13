/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

import { VideoCachePort } from '@videos/application/ports';
import { AppConfigService } from '@videos/infrastructure/config';

@Injectable()
export class RedisCacheAdapter implements OnModuleInit, OnModuleDestroy, VideoCachePort {
  private readonly SHARDS: number = 64;
  private redisClient: Redis;

  public constructor(
    private readonly configService: AppConfigService,
    private readonly redisCacheHandler: RedisCacheHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {
    this.redisClient = new Redis({
      host: configService.CACHE_HOST,
      port: configService.CACHE_PORT,
    });

    this.redisClient.on('connecting', () => {
      this.logger.info('⏳ Redis cache connecting...');
    });
    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis cache connected');
    });
    this.redisClient.on('error', (error) => {
      this.logger.error('❌ An Error occured in redis cache', error);
    });
  }

  public async onModuleInit() {}

  public onModuleDestroy() {
    this.redisClient.disconnect();
  }

  cacheVideo(videoId: string, userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  getVideo(videoId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
