import { GetUserProfileFromAuthIdDto } from '@app/contracts/query';

export class GetUserProfileFromAuthIdQuery {
  constructor(public readonly getUserProfileFromAuthIdDto: GetUserProfileFromAuthIdDto) {}
}
