import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelMonitizedEvent } from './channel-monitized.event';

@EventsHandler(ChannelMonitizedEvent)
export class ChannelMonitizedEventHandler implements IEventHandler<ChannelMonitizedEvent> {
  handle({ channelAggregate }: ChannelMonitizedEvent) {
    const channel = channelAggregate.getChannelSnapshot();
    console.log(`Channel monitized: ${JSON.stringify(channel)}`);
  }
}
