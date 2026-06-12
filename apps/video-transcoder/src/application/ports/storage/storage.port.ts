import { Readable } from 'stream';

export interface TranscoderStoragePort {
  getRawVideoFileAsReadableStream(fileIdentifier: string): Promise<Readable>;

  getTranscodedFileIdentifier(videoId: string): string;

  uploadTranscodedVideoDirectory(options: {
    videoId: string;
    directoryPath: string;
  }): Promise<{ hlsManifestKey: string }>;
}

export const TRANSCODER_STORAGE_PORT = Symbol('TRANSCODER_STORAGE_PORT');
