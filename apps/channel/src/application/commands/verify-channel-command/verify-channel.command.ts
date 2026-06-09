import { ChannelVerifyByIdDto } from '@app/contracts/protocols/channel';

export class VerifyChannelCommand {
  public constructor(public readonly verifyChannelDto: ChannelVerifyByIdDto) {}
}
