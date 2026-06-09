import { UserChangePreferredLanguageDto } from '@app/contracts/protocols/users';

export class ChangeLanguageCommand {
  constructor(public readonly userChangePreferredLanguageDto: UserChangePreferredLanguageDto) {}
}
