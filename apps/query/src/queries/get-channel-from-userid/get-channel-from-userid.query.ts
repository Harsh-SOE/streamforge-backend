import { GetChannelFromUserIdDto } from '@app/contracts/query';

export class GetChannelFromUserIdQuery {
  constructor(public readonly getChannelFromUserIdDto: GetChannelFromUserIdDto) {}
}
