export interface ViewCachePort {
  getTotalViews(videoId: string): Promise<number>;

  recordView(videoId: string, userId: string): Promise<number>;
}

export const VIEWS_CACHE_PORT = Symbol('VIEWS_CACHE_PORT');
