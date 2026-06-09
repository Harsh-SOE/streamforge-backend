import { UserGrpcThemePreferences } from '@app/contracts/protocols/users';

import { DomainThemePreference } from '@users/domain/enums';

export const DomainToTransportThemePreferenceACL: Record<
  DomainThemePreference,
  UserGrpcThemePreferences
> = {
  [DomainThemePreference.SYSTEM]: UserGrpcThemePreferences.SYSTEM,
  [DomainThemePreference.LIGHT]: UserGrpcThemePreferences.LIGHT,
  [DomainThemePreference.DARK]: UserGrpcThemePreferences.DARK,
};
