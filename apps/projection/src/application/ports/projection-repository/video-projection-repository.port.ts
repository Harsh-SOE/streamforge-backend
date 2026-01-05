import { VideoPublishedIntegrationEvent } from '@app/common/events/videos';

export interface VideoProjectionRepositoryPort {
  saveVideo(data: VideoPublishedIntegrationEvent): Promise<boolean>;

  saveManyVideos(data: VideoPublishedIntegrationEvent[]): Promise<number>;

  // todo: make an integration event for video updated event...
  // updateVideo(videoId: string, data: Partial<VideoUploadedEventDto>): Promise<boolean>;

  // deleteVideo(videoId: string): Promise<boolean>;
}

export const VIDEO_PROJECTION_REPOSITORY_PORT = Symbol('VIDEO_PROJECTION_REPOSITORY_PORT');
