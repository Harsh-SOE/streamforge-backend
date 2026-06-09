import { GetUserProfileFromAuthIdDto } from '@app/contracts/protocols/read';

export class GetUserProfileFromAuthIdQuery {
  constructor(public readonly getUserProfileFromAuthIdDto: GetUserProfileFromAuthIdDto) {}
}
