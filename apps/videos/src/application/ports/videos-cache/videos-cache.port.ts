export interface VideoCachePort {
  cacheVideo(videoId: string, userId: string): Promise<number>;

  getVideo(videoId: string): Promise<number>;
}

export const VIDEOS_CACHE_PORT = Symbol('VIDEOS_CACHE_PORT');
