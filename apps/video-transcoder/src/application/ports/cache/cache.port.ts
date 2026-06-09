export interface CachePort {
  getFromCache(key: string): Promise<string | undefined>;

  setInCache(key: string, value: string, ttl: number): Promise<boolean>;

  deleteFromCache(key: string): Promise<boolean>;

  setMultipleValuesInCache(
    data: Array<{ key: string; value: string; ttl?: number }>,
  ): Promise<boolean>;

  getMultipleValuesFromCache(keys: Array<string>): Promise<string[]>;

  deleteMultipleValuesFromCache(keys: Array<string>): Promise<boolean>;
}

export const CACHE_PORT = Symbol('CACHE_PORT');
