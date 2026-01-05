import { UserChangePreferredThemeDto } from '@app/contracts/users';

export class ChangeThemeCommand {
  public constructor(public readonly userChangePreferredThemeDto: UserChangePreferredThemeDto) {}
}
