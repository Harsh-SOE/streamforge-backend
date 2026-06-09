import { UserChangePreferredThemeDto } from '@app/contracts/protocols/users';

export class ChangeThemeCommand {
  public constructor(public readonly userChangePreferredThemeDto: UserChangePreferredThemeDto) {}
}
