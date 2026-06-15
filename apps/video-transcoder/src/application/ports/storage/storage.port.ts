import { Readable } from 'stream';

export interface TranscoderStoragePort {
  getTranscodedFileKey(videoId: string): string;

  getRawFileKey(videoId: string): string;

  getRawVideoFileAsReadableStream(videoId: string): Promise<Readable>;

  uploadTranscodedVideoDirectory(options: {
    videoId: string;
    directoryPath: string;
  }): Promise<{ hlsManifestKey: string }>;
}

export const TRANSCODER_STORAGE_PORT = Symbol('TRANSCODER_STORAGE_PORT');
