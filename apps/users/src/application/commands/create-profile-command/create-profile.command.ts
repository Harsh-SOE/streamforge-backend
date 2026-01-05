import { UserCreateProfileDto } from '@app/contracts/users';

export class CreateProfileCommand {
  public constructor(public readonly userCreateProfileDto: UserCreateProfileDto) {}
}
