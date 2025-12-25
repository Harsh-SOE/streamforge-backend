import { UserProfileUpdatedEventDto } from '@app/contracts/users';

export class UserProfileUpdatedProjectionEvent {
  public constructor(public readonly userProfileUpdatedEventDto: UserProfileUpdatedEventDto) {}
}
