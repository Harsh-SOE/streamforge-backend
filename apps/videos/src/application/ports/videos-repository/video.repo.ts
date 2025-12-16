import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';
import { VideoAggregate } from '@videos/domain/aggregates';

export interface VideoRepositoryPort {
  saveVideo(model: VideoAggregate): Promise<VideoAggregate>;

  saveManyVideos(models: VideoAggregate[]): Promise<number>;

  updateVideoPublishStatusById(
    id: string,
    newPublishStatus: VideoDomainPublishStatus,
  ): Promise<VideoAggregate>;

  updateVideoVisibilityStatusById(
    id: string,
    newPublishStatus: VideoDomainVisibiltyStatus,
  ): Promise<VideoAggregate>;

  updateOneVideoById(id: string, newVideoModel: VideoAggregate): Promise<VideoAggregate>;

  findOneVideoById(id: string): Promise<VideoAggregate | undefined>;
}

export const VIDEOS_RESPOSITORY_PORT = Symbol.for('VIDEOS_RESPOSITORY_PORT');
