import { VideoUploadedEventDto } from '@app/contracts/videos';

export interface VideoProjectionBufferPort {
  bufferVideoCards(event: VideoUploadedEventDto): Promise<void>;

  processVideoCards(): Promise<number | void>;
}

export const VIDEO_PROJECTION_BUFFER_PORT = Symbol('VIDEO_PROJECTION_BUFFER_PORT');
