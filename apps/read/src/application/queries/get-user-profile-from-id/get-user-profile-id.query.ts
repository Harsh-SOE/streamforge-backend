import { GetUserProfileFromIdDto } from '@app/contracts/protocols/read';

export class GetUserProfileFromIdQuery {
  constructor(public readonly getUserProfileDto: GetUserProfileFromIdDto) {}
}
