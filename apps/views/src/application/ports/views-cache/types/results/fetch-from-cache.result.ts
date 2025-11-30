interface BaseCacheFetchResult {
  key: string;
}

interface FoundInCache extends BaseCacheFetchResult {
  result: 'FOUND';
  value: string;
}

interface NotFoundInCache extends BaseCacheFetchResult {
  result: 'NOT FOUND';
  value: never;
}

export type FetchFromCacheResult = FoundInCache | NotFoundInCache;
