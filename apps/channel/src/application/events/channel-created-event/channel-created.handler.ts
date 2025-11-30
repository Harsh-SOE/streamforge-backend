import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelCreatedEvent } from './channel-created.event';

@EventsHandler(ChannelCreatedEvent)
export class ChannelCreatedEventHandler implements IEventHandler<ChannelCreatedEvent> {
  handle({ channelCreatedEventDto }: ChannelCreatedEvent) {
    const channelSnapshot = channelCreatedEventDto.getChannelSnapshot();
    console.log(`channel was created: ${JSON.stringify(channelSnapshot)}`);
  }
}
