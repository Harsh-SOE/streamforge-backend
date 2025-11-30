export interface CommentCachePort {
  incrementCommentsCounter(
    userId: string,
    videoId: string,
  ): Promise<number | null>;

  getTotalCommentsCounter(videoId: string): Promise<number>;
}

export const COMMENTS_CACHE_PORT = 'COMMENTS_CACHE_PORT';
