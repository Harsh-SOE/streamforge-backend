import { UserUpdateProfileDto } from '@app/contracts/protocols/users';

export class UpdateProfileCommand {
  public constructor(public readonly userUpdateProfileDto: UserUpdateProfileDto) {}
}
