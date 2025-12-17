import { ChannelCreatedEventDto } from '@app/contracts/channel';

export class ChannelCreatedEvent {
  public constructor(public readonly channelCreatedEventDto: ChannelCreatedEventDto) {}
}
