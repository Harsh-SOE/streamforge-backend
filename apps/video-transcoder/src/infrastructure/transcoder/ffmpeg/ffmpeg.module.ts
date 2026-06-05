import { Module } from '@nestjs/common';

import { TRANSCODER_PORT } from '@transcoder/application/ports';

import { FFmpegVideoTranscoderAdapter } from './adapters';

@Module({
  imports: [],
  providers: [
    {
      provide: TRANSCODER_PORT,
      useClass: FFmpegVideoTranscoderAdapter,
    },
  ],
})
export class FFmpegModule {}
