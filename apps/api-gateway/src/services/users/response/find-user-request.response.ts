export class FindUserRequestResponse {
  public readonly id: string;
  public readonly handle: string;
  public readonly email: string;
  public readonly fullName?: string;
  public readonly dob?: string;
  public readonly phoneNumber?: string;
  public readonly isPhoneNumberVerified: boolean;
  public readonly notification: boolean;
  public readonly languagePreference: string;
  public readonly themePreference: string;
  public readonly region: string;
}
