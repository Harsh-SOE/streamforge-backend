import { ChannelCreateDto } from '@app/contracts/protocols/channel';

export class CreateChannelCommand {
  public constructor(public readonly channelCreateDto: ChannelCreateDto) {}
}
