import { UserUpdateProfileDto } from '@app/contracts/users';

export class UpdateProfileCommand {
  public constructor(public readonly userUpdateProfileDto: UserUpdateProfileDto) {}
}
