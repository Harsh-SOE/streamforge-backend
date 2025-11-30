import { ChannelFindByUserIdDto } from '@app/contracts/channel';

export class FindChannelByUserIdQuery {
  public constructor(
    public readonly findChannelByUserId: ChannelFindByUserIdDto,
  ) {}
}
