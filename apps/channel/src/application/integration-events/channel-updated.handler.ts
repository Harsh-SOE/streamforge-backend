import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ChannelUpdatedDomainEvent } from '@channel/domain/domain-events';

@EventsHandler(ChannelUpdatedDomainEvent)
export class ChannelUpdatedEventHandler implements IEventHandler<ChannelUpdatedDomainEvent> {
  handle(channelUpdatedDomainEvent: ChannelUpdatedDomainEvent) {
    console.log(`Channel updated: ${JSON.stringify(channelUpdatedDomainEvent)}`);
  }
}
