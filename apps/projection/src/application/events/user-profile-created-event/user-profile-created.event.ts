import { UserProfileCreatedEventDto } from '@app/contracts/users';

export class UserProfileCreatedProjectionEvent {
  public constructor(public readonly userProfileCreatedEventDto: UserProfileCreatedEventDto) {}
}
