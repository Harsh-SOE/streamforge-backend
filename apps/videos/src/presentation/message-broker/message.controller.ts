import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { VideoTranscodedUpdateIdentifierDto } from '@app/contracts/video-transcoder';

import { MessageHandlerService } from './message.service';
import { GrpcFilter } from '../filters';

@UseFilters(GrpcFilter)
@Controller()
export class MessageController {
  constructor(private readonly messageHandlerService: MessageHandlerService) {}

  @EventPattern('video-service.transcoded')
  updateVideoIdentifier(transcodedVideoMessage: VideoTranscodedUpdateIdentifierDto) {
    return this.messageHandlerService.updateVideoIdentifier(transcodedVideoMessage);
  }
}
