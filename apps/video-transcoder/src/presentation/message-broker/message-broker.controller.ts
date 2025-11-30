import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { VIDEO_TRANSCODER } from '@app/clients';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { TranscodeVideoMessage } from '@app/contracts/video-transcoder';

import { VideoTranscoderService } from './message-broker.service';

@Controller()
export class VideoTranscoderController {
  constructor(
    private readonly videoTranscoderService: VideoTranscoderService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  @EventPattern(VIDEO_TRANSCODER.VIDEO_TRANSCODE_EVENT)
  transcodeVideo(@Payload() transcodeVideoMessage: TranscodeVideoMessage) {
    this.logger.info(`Transcoding video with info: `, transcodeVideoMessage);

    return this.videoTranscoderService.transcodeVideo(transcodeVideoMessage);
  }
}
