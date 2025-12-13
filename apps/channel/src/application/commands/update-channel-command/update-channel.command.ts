import { ChannelUpdateByIdDto } from '@app/contracts/channel';

export class UpdateChannelCommand {
  public constructor(public readonly channelUpdateByIdDto: ChannelUpdateByIdDto) {}
}
