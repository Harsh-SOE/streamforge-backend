import { Module } from '@nestjs/common';

import { VideoTranscoderModule } from '@transcoder/presentation';
import { AppConfigModule } from '@transcoder/infrastructure/config';

import { AppHealthModule } from './infrastructure/health';

@Module({
  imports: [AppConfigModule, VideoTranscoderModule, AppHealthModule],
})
export class AppModule {}
