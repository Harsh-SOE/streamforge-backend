import { Inject, Injectable } from '@nestjs/common';

import { VideoTranscodedIntegrationEvent } from '@app/contracts/events/videos';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

@Injectable()
export class IntegrationEventsConsumer {
  public constructor(
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async onVideoTranscodedEventConsumer(
    videoTranscodedIntegratedEvent: VideoTranscodedIntegrationEvent,
  ) {
    // react to video transcoded event here...
    console.log(`Video with id:${videoTranscodedIntegratedEvent.id} was transcoded successfully`);
    await new Promise(() => {});
  }
}
