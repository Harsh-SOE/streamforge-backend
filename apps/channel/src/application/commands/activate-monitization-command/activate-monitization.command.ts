import { ChannelActivateMonitizationDto } from '@app/contracts/protocols/channel';

export class ActivateMonitizationCommand {
  public constructor(
    public readonly channelActivateMonitizationDto: ChannelActivateMonitizationDto,
  ) {}
}
