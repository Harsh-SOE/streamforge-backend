import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelUpdatedEvent } from './channel-updated.event';

@EventsHandler(ChannelUpdatedEvent)
export class ChannelUpdatedEventHandler implements IEventHandler<ChannelUpdatedEvent> {
  handle({ channelAggregate }: ChannelUpdatedEvent) {
    const channel = channelAggregate.getChannelSnapshot();
    console.log(`Channel updated: ${JSON.stringify(channel)}`);
  }
}
