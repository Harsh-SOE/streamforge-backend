import { VideoAggregate } from '@videos/domain/aggregates';

export interface VideosBufferPort {
  bufferVideo(video: VideoAggregate): Promise<void>;

  processVideosBatch(): Promise<number | void>;
}

export const VIDEOS_BUFFER_PORT = Symbol('VIDEOS_BUFFER_PORT');
