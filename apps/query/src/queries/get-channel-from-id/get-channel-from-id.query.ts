import { GetChannelFromIdDto } from '@app/contracts/query';

export class GetChannelFromIdQuery {
  constructor(public readonly getChannelFromIdDto: GetChannelFromIdDto) {}
}
