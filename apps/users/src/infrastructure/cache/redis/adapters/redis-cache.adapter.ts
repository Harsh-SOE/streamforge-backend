import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { UserCachePort } from '@users/application/ports';

@Injectable()
export class RedisCacheAdapter implements UserCachePort {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  public async getFromCache(key: string): Promise<string | undefined> {
    return await this.cacheManager.get(key);
  }

  public async setInCache(key: string, value: string, ttl: number): Promise<boolean> {
    await this.cacheManager.set(key, value, ttl);
    return true;
  }

  public async deleteFromCache(key: string): Promise<boolean> {
    return await this.cacheManager.del(key);
  }

  public async setMultipleValuesInCache(
    data: Array<{ key: string; value: string; ttl?: number }>,
  ): Promise<boolean> {
    await this.cacheManager.mset(data);
    return true;
  }

  public async getMultipleValuesFromCache(keys: Array<string>): Promise<string[]> {
    return (await this.cacheManager.mget(keys)) as string[];
  }

  public async deleteMultipleValuesFromCache(keys: Array<string>): Promise<boolean> {
    await this.cacheManager.mdel(keys);
    return true;
  }
}
