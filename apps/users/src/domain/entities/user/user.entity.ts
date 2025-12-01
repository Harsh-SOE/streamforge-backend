import {
  UserHandle,
  UserDOB,
  UserEmail,
  UserPhoneNumber,
  UserThemePreference,
  UserLanguagePreference,
  UserRegion,
  UserAvatar,
} from '@users/domain/value-objects';

export class UserEntity {
  constructor(
    private readonly id: string,
    private readonly userAuthId: string,
    private readonly handle: UserHandle,
    private email: UserEmail,
    private avatar: UserAvatar,
    private dob: UserDOB,
    private phoneNumber: UserPhoneNumber,
    private isPhoneNumberVerified: boolean,
    private notification: boolean,
    private themePreference: UserThemePreference,
    private languagePreference: UserLanguagePreference,
    private region: UserRegion,
  ) {}

  public static create(
    id: string,
    userAuthId: string,
    handle: string,
    email: string,
    avatar: string,
    dob?: Date,
    phoneNumber?: string,
    isPhoneNumberVerified?: boolean,
    notification?: boolean,
    preferredTheme?: string,
    preferredLanguage?: string,
    region?: string,
  ): UserEntity {
    return new UserEntity(
      id,
      userAuthId,
      UserHandle.create(handle),
      UserEmail.create(email),
      UserAvatar.create(avatar),
      UserDOB.create(dob),
      UserPhoneNumber.create(phoneNumber),
      isPhoneNumberVerified ?? false,
      notification ?? true,
      UserThemePreference.create(preferredTheme),
      UserLanguagePreference.create(preferredLanguage),
      UserRegion.create(region),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getUserAuthId() {
    return this.userAuthId;
  }

  public getUserHandle(): string {
    return this.handle.getValue();
  }

  public getEmail(): string {
    return this.email.getValue();
  }

  public getAvatar(): string {
    return this.avatar.getValue();
  }

  public getDob(): Date | undefined {
    return this.dob.getValue();
  }

  public getPhoneNumber(): string | undefined {
    return this.phoneNumber.getValue();
  }

  public getIsPhoneNumberVerified(): boolean {
    return this.isPhoneNumberVerified;
  }

  public getNotification(): boolean {
    return this.notification;
  }

  public getThemePreference(): string {
    return this.themePreference.getValue();
  }

  public getLanguagePreference(): string {
    return this.languagePreference.getValue();
  }

  public getRegion(): string {
    return this.region.getValue();
  }

  public getSnapshot() {
    return {
      id: this.id,
      userAuthId: this.userAuthId,
      handle: this.handle.getValue(),
      email: this.email.getValue(),
      avatar: this.avatar.getValue(),
      dob: this.dob.getValue(),
      phoneNumber: this.phoneNumber.getValue(),
      isPhoneNumbetVerified: this.isPhoneNumberVerified,
      notification: this.notification,
      themePreference: this.themePreference.getValue(),
      languagePreference: this.languagePreference.getValue(),
      region: this.region.getValue(),
    };
  }

  public updateEmail(newEmail: string): void {
    this.email = UserEmail.create(newEmail);
    return;
  }

  public updateAvatar(newAvatar: string): void {
    this.avatar = UserAvatar.create(newAvatar);
    return;
  }

  public updateDOB(newDOB: Date): void {
    this.dob = UserDOB.create(newDOB);
    return;
  }

  public updatePhoneNumber(newPhoneNumber: string): void {
    this.phoneNumber = UserPhoneNumber.create(newPhoneNumber);
    this.isPhoneNumberVerified = false;
    return;
  }

  public verifyPhoneNumber(): void {
    if (this.isPhoneNumberVerified) {
      throw new Error(`Phone number is already verified`);
    }
    this.isPhoneNumberVerified = true;
    return;
  }

  public updateNotificationStatus(newNotificationStatus: boolean): void {
    this.notification = newNotificationStatus;
    return;
  }

  public updateThemePreference(newThemePreference: string): void {
    this.themePreference = UserThemePreference.create(newThemePreference);
    return;
  }

  public updateLanguagePreference(newLanguagePreference: string): void {
    this.languagePreference = UserLanguagePreference.create(
      newLanguagePreference,
    );
    return;
  }

  public updateRegion(newRegion: string): void {
    this.region = UserRegion.create(newRegion);
    return;
  }
}
