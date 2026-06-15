import { Inject, Injectable } from '@nestjs/common';

import { VideoProcessedIntegrationEvent } from '@app/contracts/events/videos';
import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

@Injectable()
export class VideosIntegrationEventHandler {
  public constructor(
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly integrationEventPublisher: IntegrationEventsPublisherPort,
  ) {}

  public async onVideoTranscodedEventConsumer(
    videoTranscodedIntegratedEvent: VideoProcessedIntegrationEvent,
  ) {
    // react to video transcoded event here...
    console.log(
      `Video with id:${videoTranscodedIntegratedEvent.id} was transcoded successfully, 
      and will now be updated to include: ${JSON.stringify(videoTranscodedIntegratedEvent.payload)}`,
    );
    // update the video to include metadata and hlsManifestKey
    await new Promise(() => {});
  }

  public async onVideoMetadataSavedEventConsumer() {}
}
