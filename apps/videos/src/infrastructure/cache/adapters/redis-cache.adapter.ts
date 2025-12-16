/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

import { VideoCachePort } from '@videos/application/ports';
import { VideoRedisClient } from '@videos/infrastructure/clients/redis';

@Injectable()
export class RedisCacheAdapter implements VideoCachePort {
  public constructor(
    private readonly redisCacheHandler: RedisCacheHandler,
    private readonly videosRedisClient: VideoRedisClient,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  cacheVideo(videoId: string, userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  getVideo(videoId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
