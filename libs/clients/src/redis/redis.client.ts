import Redis from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';

export interface RedisClientConfig {
  host: string;
  port: number;
}

export const REDIS_CLIENT_CONFIG = Symbol('REDIS_CLIENT_CONFIG');

@Injectable()
export class RedisClient {
  public constructor(@Inject(REDIS_CLIENT_CONFIG) private readonly config: RedisClientConfig) {}

  public getClient() {
    return new Redis(`${this.config.host}:${this.config.port}`, { lazyConnect: true });
  }
}
