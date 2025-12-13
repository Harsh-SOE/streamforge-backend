import { DatabaseFilter } from '@app/common/types';

import { Video } from '@peristance/videos';

import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';
import { VideoAggregate } from '@videos/domain/aggregates';

export interface VideoCommandRepositoryPort {
  save(model: VideoAggregate): Promise<VideoAggregate>;

  saveMany(models: VideoAggregate[]): Promise<number>;

  updatePublishStatus(
    filter: DatabaseFilter<Video>,
    newPublishStatus: VideoDomainPublishStatus,
  ): Promise<VideoAggregate>;

  updateVisibilityStatus(
    filter: DatabaseFilter<Video>,
    newPublishStatus: VideoDomainVisibiltyStatus,
  ): Promise<VideoAggregate>;

  updateOne(filter: DatabaseFilter<Video>, newVideoModel: VideoAggregate): Promise<VideoAggregate>;

  updateOneById(id: string, newVideoModel: VideoAggregate): Promise<VideoAggregate>;

  updateMany(filter: DatabaseFilter<Video>, newVideoModel: VideoAggregate): Promise<number>;

  findOneById(id: string): Promise<VideoAggregate>;
}

export const VIDEOS_COMMAND_RESPOSITORY_PORT = Symbol('VIDEOS_COMMAND_RESPOSITORY_PORT');
