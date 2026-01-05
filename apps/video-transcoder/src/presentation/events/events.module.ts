import { Module } from '@nestjs/common';

import { VideoTranscoderCommandHandlers } from '@transcoder/application/commands';
import { PlatformModule } from '@transcoder/infrastructure/platform/platform.module';

import { VideoTranscoderService } from '../transcoder/video-transcoder.service';
import { EventsListenerService } from './events-listener.service';

@Module({
  imports: [PlatformModule],
  providers: [VideoTranscoderService, EventsListenerService, ...VideoTranscoderCommandHandlers],
})
export class VideoTranscoderModule {}
