import { UserGrpcThemePreferences } from '@app/contracts/protocols/users';

import { DomainThemePreference } from '@users/domain/enums';

export const TransportToDomainThemeEnumACL: Record<
  UserGrpcThemePreferences,
  DomainThemePreference
> = {
  [UserGrpcThemePreferences.SYSTEM]: DomainThemePreference.SYSTEM,
  [UserGrpcThemePreferences.DARK]: DomainThemePreference.DARK,
  [UserGrpcThemePreferences.LIGHT]: DomainThemePreference.LIGHT,
  [UserGrpcThemePreferences.UNRECOGNIZED]: DomainThemePreference.LIGHT,
};
