import { ThemePreferences } from '@peristance/user';

export class UserQueryModel {
  public readonly id: string;
  public readonly authUserId: string;
  public readonly email: string;
  public readonly handle: string;
  public readonly avatar: string;
  public readonly dob: Date | null;
  public readonly phoneNumber: string | null;
  public readonly isPhoneNumberVerified: boolean;
  public readonly notification: boolean;
  public readonly themePreference: ThemePreferences;
  public readonly languagePreference: string;
  public readonly region: string;
}
