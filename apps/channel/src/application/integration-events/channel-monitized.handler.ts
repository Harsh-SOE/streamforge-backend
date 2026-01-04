import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelMonitizedDomainEvent } from '@channel/domain/domain-events';

@EventsHandler(ChannelMonitizedDomainEvent)
export class ChannelMonitizedEventHandler implements IEventHandler<ChannelMonitizedDomainEvent> {
  handle(channelMonitizedDomainEvent: ChannelMonitizedDomainEvent) {
    console.log(`Channel monitized: ${JSON.stringify(channelMonitizedDomainEvent)}`);
  }
}
