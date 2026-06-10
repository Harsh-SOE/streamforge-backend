import { EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

import { VideoTranscodedIntegrationEvent } from '@app/contracts/events/videos';

@Injectable()
export class EventsService {
  public constructor(private readonly eventBus: EventBus) {}

  public async onVideoTranscoded(videoTranscodedIntegratedEvent: VideoTranscodedIntegrationEvent) {
    // await this.eventBus.publish<VideoTranscodedDomainEvent>(
    //   new VideoTranscodedDomainEvent({}),
    // );
    // react to video transcoded event here...
    console.log(`Video with id:${videoTranscodedIntegratedEvent.id} was transcoded successfully`);
    await new Promise(() => {});
  }
}
