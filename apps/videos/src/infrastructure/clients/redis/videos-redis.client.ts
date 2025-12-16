import Redis from 'ioredis';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

import { AppConfigService } from '@videos/infrastructure/config';

@Injectable()
export class VideoRedisClient implements OnModuleInit {
  public redisClient: Redis;

  public constructor(
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redisHandler: RedisCacheHandler,
  ) {}

  public async onModuleInit() {
    const redisConnectionOperation = () => {
      this.redisClient = new Redis({
        host: this.configService.CACHE_HOST,
        port: this.configService.CACHE_PORT,
      });
    };

    await this.redisHandler.execute(redisConnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.redisClient.on('connecting', () => {
      this.logger.info(`⏳ Redis buffer connecting...`);
    });

    this.redisClient.on('connect', () => {
      this.logger.info('✅ Redis buffer connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.info('❌ Error buffer occured while connecting to redis', error);
    });

    try {
      await this.redisClient.xgroup(
        'CREATE',
        this.configService.BUFFER_KEY,
        this.configService.BUFFER_GROUPNAME,
        '0',
        'MKSTREAM',
      );
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('BUSYGROUP')) {
        this.logger.alert(
          `Stream with key: ${this.configService.BUFFER_KEY} already exists, skipping creation`,
        );
      } else {
        throw err;
      }
    }
  }
}
