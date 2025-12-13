import { GetDislikesVideoQueryHandler } from './get-dislikes-video-queries/get-dislikes-video.handler';
import { GetLikesVideoQueryHandler } from './get-likes-video-queries/get-likes-video.handler';

export const LikeQueriesHandler = [GetDislikesVideoQueryHandler, GetLikesVideoQueryHandler];

export * from './get-dislikes-video-queries/get-dislikes-video.handler';
export * from './get-dislikes-video-queries/get-dislikes-video.queries';

export * from './get-likes-video-queries/get-likes-video.handler';
export * from './get-likes-video-queries/get-likes-video.queries';

export * from './model/reaction.query-model';
