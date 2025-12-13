import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { VideoTranscodedUpdateIdentifierDto } from '@app/contracts/video-transcoder';

import { VideoTranscodedEvent } from '@videos/application/events';

@Injectable()
export class MessageHandlerService {
  public constructor(private readonly eventBus: EventBus) {}

  updateVideoIdentifier(transcodedVideoMessage: VideoTranscodedUpdateIdentifierDto) {
    this.eventBus.publish<VideoTranscodedEvent>(new VideoTranscodedEvent(transcodedVideoMessage));
  }
}
