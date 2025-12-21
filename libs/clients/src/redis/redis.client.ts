import Redis from 'ioredis';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';

export const REDIS_HOST = Symbol('REDIS_HOST');
export const REDIS_PORT = Symbol('REDIS_PORT');
export const REDIS_STREAM_KEY = Symbol('REDIS_STREAM_KEY');
export const REDIS_STREAM_GROUPNAME = Symbol('REDIS_STREAM_GROUPNAME');

@Injectable()
export class RedisClient implements OnModuleInit {
  public client: Redis;

  public constructor(
    @Inject(REDIS_HOST) private readonly host: string,
    @Inject(REDIS_PORT) private readonly port: number,
    @Inject(REDIS_STREAM_KEY) private readonly redisStreamKey: string,
    @Inject(REDIS_STREAM_GROUPNAME) private readonly redisStreamGroupname: string,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly redisHandler: RedisCacheHandler,
  ) {}

  public async onModuleInit() {
    const redisConnectionOperation = () => {
      this.client = new Redis(`${this.host}:${this.port}`);
    };

    await this.redisHandler.execute(redisConnectionOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.client.on('connecting', () => {
      this.logger.alert(`Redis client connecting...`);
    });

    this.client.on('connect', () => {
      this.logger.alert('Redis client connected successfully');
    });

    try {
      await this.client.xgroup(
        'CREATE',
        this.redisStreamKey,
        this.redisStreamGroupname,
        '0',
        'MKSTREAM',
      );

      this.logger.info(`Stream with key:${this.redisStreamKey} was created successfully`);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('BUSYGROUP')) {
        this.logger.alert(
          `Stream with key: ${this.redisStreamKey} already exists, skipping creation`,
        );
      } else {
        throw err;
      }
    }
  }
}
