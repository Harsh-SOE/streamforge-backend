import { TranscodeVideoOptions } from './options/trancode-video.options';

export interface TranscoderPort {
  transcodeVideo(transcodeVideoOptions: TranscodeVideoOptions): Promise<void>;
}

export const TRANSCODER_PORT = Symbol('TRANSCODER_PORT');
