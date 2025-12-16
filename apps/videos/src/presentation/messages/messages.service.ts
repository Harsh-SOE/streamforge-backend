import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { VideoTranscodedEventDto } from '@app/contracts/video-transcoder';

import { VideoTranscodedEvent } from '@videos/application/events/video-transcoded-event';

@Injectable()
export class MessagesService {
  public constructor(private readonly eventBus: EventBus) {}

  public updateVideoIdentifier(transcodedVideoMessage: VideoTranscodedEventDto) {
    this.eventBus.publish<VideoTranscodedEvent>(new VideoTranscodedEvent(transcodedVideoMessage));
  }
}
