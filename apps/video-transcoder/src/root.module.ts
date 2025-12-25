import { Module } from '@nestjs/common';

import { VideoTranscoderModule } from '@transcoder/presentation';
import { TranscoderConfigModule } from '@transcoder/infrastructure/config';

import { AppHealthModule } from './infrastructure/health';

@Module({
  imports: [TranscoderConfigModule, VideoTranscoderModule, AppHealthModule],
})
export class RootModule {}
