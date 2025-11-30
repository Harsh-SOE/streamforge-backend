import { ChannelFindByIdDto } from '@app/contracts/channel';

export class FindChannelByIdQuery {
  public constructor(public readonly findChannelById: ChannelFindByIdDto) {}
}
