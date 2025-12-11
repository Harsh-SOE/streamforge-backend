import { GetUserProfileFromIdDto } from '@app/contracts/query';

export class GetUserProfileFromIdQuery {
  constructor(public readonly getUserProfileDto: GetUserProfileFromIdDto) {}
}
