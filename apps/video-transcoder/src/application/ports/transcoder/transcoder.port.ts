export interface VideosProcessorPort {
  processVideo(videoId: string): Promise<void>;
}

export const PROCESSOR_PORT = Symbol('TRANSCODER_PORT');
