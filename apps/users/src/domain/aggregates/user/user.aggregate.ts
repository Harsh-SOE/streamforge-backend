import { AggregateRoot } from '@nestjs/cqrs';

import { UserEntity } from '@users/domain/entities';
import {
  ChangeLanguageEvent,
  ChangeNotificationStatusEvent,
  ChangeThemeEvent,
  CreateProfileEvent,
  PhoneNumberVerfiedEvent,
  UpdateProfileEvent,
} from '@users/application/events';

export class UserAggregate extends AggregateRoot {
  public constructor(private user: UserEntity) {
    super();
  }

  public getUserSnapshot() {
    return this.user.getSnapshot();
  }

  private getUserEntity() {
    return this.user;
  }

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
    isOnBoardingComplete?: boolean,
    region?: string,
  ): UserAggregate {
    const userEntity = UserEntity.create(
      id,
      userAuthId,
      handle,
      email,
      avatar,
      dob,
      phoneNumber,
      isPhoneNumberVerified,
      notification,
      preferredTheme,
      preferredLanguage,
      region,
    );
    const userAggregate = new UserAggregate(userEntity);

    // add an event that user was created...
    userAggregate.apply(new CreateProfileEvent(userAggregate));

    return userAggregate;
  }

  public updateUserProfile(dob?: Date, phoneNumber?: string, avatar?: string) {
    if (dob) this.getUserEntity().updateDOB(new Date(dob));
    if (phoneNumber) this.getUserEntity().updatePhoneNumber(phoneNumber);
    if (avatar) this.getUserEntity().updateAvatar(avatar);

    this.apply(
      new UpdateProfileEvent({
        updatedProfile: {
          id: this.getUserSnapshot().id,
          dob: dob?.toISOString(),
          // avatar: this.getUserSnapshot(),
          phoneNumber,
        },
      }),
    );
  }

  public verifyUserPhoneNumber() {
    if (!this.getUserEntity().getPhoneNumber()) {
      return;
    }
    this.getUserEntity().verifyPhoneNumber();

    // event for phone number verification here...
    this.apply(
      new PhoneNumberVerfiedEvent({
        id: this.getUserSnapshot().id,
        phoneNumber: this.getUserSnapshot().phoneNumber as string,
      }),
    );
  }

  public changeUserPreferredTheme(newTheme: string) {
    this.getUserEntity().updateThemePreference(newTheme);

    // event for theme changed here...
    this.apply(
      new ChangeThemeEvent({
        id: this.getUserSnapshot().id,
        theme: this.getUserSnapshot().themePreference,
      }),
    );
  }

  public changeUserPreferredlanguage(newLanguage: string) {
    this.getUserEntity().updateLanguagePreference(newLanguage);

    // event for language changed here...
    this.apply(
      new ChangeLanguageEvent({
        id: this.getUserSnapshot().id,
        langauge: this.getUserEntity().getLanguagePreference(),
      }),
    );
  }

  public changeUserNotificationPreference(newNotificationStatus: boolean) {
    this.getUserEntity().updateNotificationStatus(newNotificationStatus);

    // event for notification status changed here...
    this.apply(
      new ChangeNotificationStatusEvent({
        id: this.getUserSnapshot().id,
        status: this.getUserSnapshot().notification,
      }),
    );
  }
}
