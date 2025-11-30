interface BaseCacheDeletionResult {
  key: string;
}

interface DeletedFromCache extends BaseCacheDeletionResult {
  result: 'DELETED';
  value: string;
}

interface NotDeletedFromCache extends BaseCacheDeletionResult {
  result: 'NOT DELETED';
  value: never;
}

export type DeleteFromCacheResult = DeletedFromCache | NotDeletedFromCache;
