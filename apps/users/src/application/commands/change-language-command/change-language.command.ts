import { UserChangePreferredLanguageDto } from '@app/contracts/users';

export class ChangeLanguageCommand {
  constructor(public readonly userChangePreferredLanguageDto: UserChangePreferredLanguageDto) {}
}
