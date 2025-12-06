import { GetUserProfileFromIdDto } from '@app/contracts/query';

export class GetUserProfileQuery {
  constructor(public readonly getUserProfileDto: GetUserProfileFromIdDto) {}
}
