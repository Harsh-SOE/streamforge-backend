import { UserCreateProfileDto } from '@app/contracts/protocols/users';

export class CreateProfileCommand {
  public constructor(public readonly userCreateProfileDto: UserCreateProfileDto) {}
}
