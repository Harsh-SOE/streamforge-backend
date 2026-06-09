import { GetChannelFromIdDto } from '@app/contracts/protocols/read';

export class GetChannelFromIdQuery {
  constructor(public readonly getChannelFromIdDto: GetChannelFromIdDto) {}
}
