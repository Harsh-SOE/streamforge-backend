import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { VideoTranscodedEventDto } from '@app/contracts/video-transcoder';

import { MessagesService } from './messages.service';
import { GrpcFilter } from '../filters';

@Controller()
@UseFilters(GrpcFilter)
export class MessagesController {
  constructor(private readonly messageHandlerService: MessagesService) {}

  @EventPattern('video-service.transcoded')
  public updateVideoIdentifier(transcodedVideoMessage: VideoTranscodedEventDto) {
    return this.messageHandlerService.updateVideoIdentifier(transcodedVideoMessage);
  }
}
