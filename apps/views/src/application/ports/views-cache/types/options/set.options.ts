export interface CacheSetWithTTLOptions {
  setTTL: true;
  TTL: number;
}

export interface CacheSetWithoutTTLOptions {
  setTTL?: false;
  TTL?: never;
}

export type CacheSetoptions =
  | CacheSetWithTTLOptions
  | CacheSetWithoutTTLOptions;
