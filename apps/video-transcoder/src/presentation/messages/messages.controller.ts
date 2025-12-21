import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { VIDEO_TRANSCODER_EVENTS } from '@app/clients';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { TranscodeVideoEventDto } from '@app/contracts/video-transcoder';

import { VideoTranscoderService } from './messages.service';

@Controller()
export class VideoTranscoderController {
  constructor(
    private readonly videoTranscoderService: VideoTranscoderService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  @EventPattern(VIDEO_TRANSCODER_EVENTS.VIDEO_TRANSCODE_EVENT)
  transcodeVideo(@Payload() transcodeVideoMessage: TranscodeVideoEventDto) {
    this.logger.info(`Transcoding video with info: `, transcodeVideoMessage);

    return this.videoTranscoderService.transcodeVideo(transcodeVideoMessage);
  }
}
