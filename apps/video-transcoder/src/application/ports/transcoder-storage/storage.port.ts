import { Readable } from 'stream';

import { UploadResult, UploadOptions } from './options';

export interface TranscoderStoragePort {
  getRawVideoFileAsReadableStream(fileIdentifier: string): Promise<Readable>;

  getTranscodedFileIdentifier(videoId: string): string;

  uploadTranscodedVideoFileAsStream(
    fileStream: Readable,
    videoId: string,
    videoFileName: string,
    options?: UploadOptions,
  ): Promise<UploadResult>;
}

export const TRANSCODER_STORAGE_PORT = Symbol('TRANSCODER_STORAGE_PORT');
