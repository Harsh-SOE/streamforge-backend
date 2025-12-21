import { Module } from '@nestjs/common';

import { VideoTranscoderCommandHandlers } from '@transcoder/application/commands';
import { FrameworkModule } from '@transcoder/infrastructure/framework/framework.module';

import { VideoTranscoderService } from './messages.service';
import { VideoTranscoderController } from './messages.controller';

@Module({
  imports: [FrameworkModule],
  controllers: [VideoTranscoderController],
  providers: [VideoTranscoderService, ...VideoTranscoderCommandHandlers],
})
export class VideoTranscoderModule {}
