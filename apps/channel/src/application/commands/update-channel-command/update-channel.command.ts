import { ChannelUpdateByIdDto } from '@app/contracts/protocols/channel';

export class UpdateChannelCommand {
  public constructor(public readonly channelUpdateByIdDto: ChannelUpdateByIdDto) {}
}
