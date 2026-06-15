/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';

import { RedisClient } from '@app/clients/redis';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache/redis';

import { VideoCachePort } from '@videos/application/ports';

@Injectable()
export class RedisCacheAdapter implements VideoCachePort {
  public constructor(
    private readonly redisCacheHandler: RedisCacheHandler,
    private readonly videosRedisClient: RedisClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  cacheVideo(videoId: string, userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  getVideo(videoId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
