export interface ReactionCachePort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getTotalLikes(videoId: string): Promise<number>;
  getTotalDislikes(videoId: string): Promise<number>;
  recordLike(videoId: string, userId: string): Promise<number>;
  removeLike(videoId: string, userId: string): Promise<number>;
  recordDislike(videoId: string, userId: string): Promise<number>;
  removeDislike(videoId: string, userId: string): Promise<number>;
}

export const REACTION_CACHE_PORT = Symbol('REACTION_CACHE_PORT');
