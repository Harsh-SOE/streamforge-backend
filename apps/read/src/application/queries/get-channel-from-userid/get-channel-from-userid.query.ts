import { GetChannelFromUserIdDto } from '@app/contracts/protocols/read';

export class GetChannelFromUserIdQuery {
  constructor(public readonly getChannelFromUserIdDto: GetChannelFromUserIdDto) {}
}
