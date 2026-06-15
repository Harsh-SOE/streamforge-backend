export interface VideosProcessorPort {
  processVideo(videoId: string): Promise<{
    videoId: string;
    durationSeconds: number;
    sizeBytes: bigint;
    mimeType: string;
    height: number;
    width: number;
    hlsManifestKey: string;
  }>;
}

export const PROCESSOR_PORT = Symbol('PROCESSOR_PORT');
