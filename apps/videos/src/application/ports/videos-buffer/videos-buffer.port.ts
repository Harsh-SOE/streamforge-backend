import { VideoAggregate } from '@videos/domain/aggregates';

export interface VideosBufferPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  bufferVideo(video: VideoAggregate): Promise<void>;
}

export const VIDEOS_BUFFER_PORT = Symbol('VIDEOS_BUFFER_PORT');
