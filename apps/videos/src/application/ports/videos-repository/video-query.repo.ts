import { DatabaseFilter, DatabaseQueryFilter } from '@app/common/types';

import { Video } from '@peristance/videos';

import { VideoQueryModel } from '@videos/query-model';

export interface VideoQueryRepositoryPort {
  findOne(filter: DatabaseFilter<Video>): Promise<VideoQueryModel>;

  QueryVideos(
    filter: DatabaseFilter<Video>,
    queryOptions?: DatabaseQueryFilter<Video>,
  ): Promise<VideoQueryModel[]>;

  findOneByid(id: string): Promise<VideoQueryModel>;
}

export const VIDEO_QUERY_RESPOSITORY_PORT = Symbol(
  'VIDEO_QUERY_RESPOSITORY_PORT',
);
