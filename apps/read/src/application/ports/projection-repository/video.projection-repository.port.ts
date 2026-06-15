import { VideoCreatorReadModel } from '@read/infrastructure/repository/models/videos';

export interface VideoProjectionRepositoryPort {
  saveCreatorVideo(data: VideoCreatorReadModel): Promise<boolean>;

  // todo: make an integration event for video updated and deleted events...
}

export const VIDEO_PROJECTION_REPOSITORY_PORT = Symbol('VIDEO_PROJECTION_REPOSITORY_PORT');
