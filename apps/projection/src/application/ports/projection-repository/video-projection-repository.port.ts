import { VideoUploadedEventDto } from '@app/contracts/videos';

export interface VideoProjectionRepositoryPort {
  saveVideo(data: VideoUploadedEventDto): Promise<boolean>;

  saveManyVideos(data: VideoUploadedEventDto[]): Promise<number>;

  updateVideo(
    videoId: string,
    data: Partial<VideoUploadedEventDto>,
  ): Promise<boolean>;

  deleteVideo(videoId: string): Promise<boolean>;
}

export const VIDEO_PROJECTION_REPOSITORY_PORT = Symbol(
  'VIDEO_PROJECTION_REPOSITORY_PORT',
);
