import { ChannelAggregate } from 'apps/channel/src/domain/aggregates';

export class ChannelCreatedEvent {
  public constructor(public readonly channelCreatedEventDto: ChannelAggregate) {}
}
