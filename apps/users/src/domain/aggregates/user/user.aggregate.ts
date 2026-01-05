import { AggregateRoot } from '@nestjs/cqrs';

import {
  LanguageChangedDomainEvent,
  NotificationStatusChangedDomainEvent,
  OnboardedDomainEvent,
  PhoneNumberVerifiedDomainEvent,
  ProfileUpdatedDomainEvent,
  ThemeChangedDomainEvent,
} from '@users/domain/domain-events';
import { UserEntity } from '@users/domain/entities';

import { UserAggregateOption } from './options';

export class UserAggregate extends AggregateRoot {
  private constructor(private readonly userEntity: UserEntity) {
    super();
  }

  public getUserSnapshot() {
    return this.userEntity.getSnapshot();
  }

  private getUserEntity() {
    return this.userEntity;
  }

  public static create(data: UserAggregateOption, emitOnboardingEvent = true): UserAggregate {
    const {
      id,
      handle,
      userAuthId,
      email,
      avatarUrl,
      dob,
      isPhoneNumberVerified,
      notification,
      phoneNumber,
      preferredLanguage,
      preferredTheme,
      region,
    } = data;

    const userEntity = UserEntity.create({
      id: id,
      userAuthId: userAuthId,
      handle: handle,
      email: email,
      avatarUrl: avatarUrl,
      dob: dob,
      phoneNumber: phoneNumber,
      isPhoneNumberVerified: isPhoneNumberVerified,
      notification: notification,
      themePreference: preferredTheme,
      languagePreference: preferredLanguage,
      region: region,
    });
    const userAggregate = new UserAggregate(userEntity);

    if (emitOnboardingEvent) {
      const userEntity = userAggregate.getUserEntity();
      userAggregate.apply(
        new OnboardedDomainEvent(
          userEntity.getId(),
          userEntity.getUserAuthId(),
          userEntity.getEmail(),
          userEntity.getUserHandle(),
        ),
      );
    }

    return userAggregate;
  }

  public updateUserProfile(
    data: {
      dob?: Date;
      phoneNumber?: string;
      avatar?: string;
    },
    emitUpdatedProfileEvent = true,
  ): boolean {
    const userEntity = this.getUserEntity();
    const { dob, avatar, phoneNumber } = data;

    if (dob) userEntity.updateDOB(new Date(dob));
    if (phoneNumber) userEntity.updatePhoneNumber(phoneNumber);
    if (avatar) userEntity.updateAvatar(avatar);

    if (emitUpdatedProfileEvent) {
      this.apply(
        new ProfileUpdatedDomainEvent(
          userEntity.getId(),
          userEntity.getAvatarUrl(),
          userEntity.getDob()?.toISOString(),
          userEntity.getPhoneNumber(),
        ),
      );
    }

    return true;
  }

  public verifyUserPhoneNumber(emitPhoneNumberVerifiedEvent = true): boolean {
    const userEntity = this.getUserEntity();

    if (!userEntity.getPhoneNumber()) {
      return false;
    }
    userEntity.verifyPhoneNumber();

    if (emitPhoneNumberVerifiedEvent) {
      this.apply(
        new PhoneNumberVerifiedDomainEvent(
          userEntity.getId(),
          userEntity.getPhoneNumber() as string,
        ),
      );
    }

    return true;
  }

  public changeUserPreferredTheme(newTheme: string, emitThemeChangedEvent = true): boolean {
    const userEntity = this.getUserEntity();
    userEntity.updateThemePreference(newTheme);

    if (emitThemeChangedEvent) {
      this.apply(new ThemeChangedDomainEvent(userEntity.getId(), userEntity.getThemePreference()));
    }

    return true;
  }

  public changeUserPreferredLanguage(newLanguage: string, emitLanguageEvent = true): boolean {
    const userEntity = this.getUserEntity();
    userEntity.updateLanguagePreference(newLanguage);

    if (emitLanguageEvent) {
      this.apply(
        new LanguageChangedDomainEvent(userEntity.getId(), userEntity.getLanguagePreference()),
      );
    }

    return true;
  }

  public changeUserNotificationPreference(
    newNotificationStatus: boolean,
    emitNotificationEvent = true,
  ): boolean {
    const userEntity = this.getUserEntity();
    userEntity.updateNotificationStatus(newNotificationStatus);

    if (emitNotificationEvent) {
      this.apply(
        new NotificationStatusChangedDomainEvent(userEntity.getId(), userEntity.getNotification()),
      );
    }
    return true;
  }
}
