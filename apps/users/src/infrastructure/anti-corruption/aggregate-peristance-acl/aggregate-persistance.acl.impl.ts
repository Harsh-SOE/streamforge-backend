import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import {
  UserHandle,
  UserDOB,
  UserEmail,
  UserPhoneNumber,
  UserThemePreference,
  UserLanguagePreference,
  UserRegion,
} from '@users/domain/value-objects';
import { UserAggregate } from '@users/domain/aggregates';
import { UserEntity } from '@users/domain/entities';

import { User } from '@peristance/user';

@Injectable()
export class UserAggregatePersistanceACL implements IAggregatePersistanceACL<
  UserAggregate,
  Omit<User, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(
    persistance: Omit<User, 'createdAt' | 'updatedAt'>,
  ): UserAggregate {
    const user = new UserEntity(
      persistance.id,
      persistance.authUserId,
      UserHandle.create(persistance.handle),
      UserEmail.create(persistance.email),
      UserDOB.create(persistance.dob ?? undefined),
      UserPhoneNumber.create(persistance.phoneNumber ?? undefined),
      persistance.isPhoneNumberVerified,
      persistance.notification,
      UserThemePreference.create(persistance.themePreference),
      UserLanguagePreference.create(persistance.languagePreference),
      persistance.onBoardingComplete,
      UserRegion.create(persistance.region),
    );
    return new UserAggregate(user);
  }
  public toPersistance(
    entity: UserAggregate,
  ): Omit<User, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.getUserSnapshot().id,
      authUserId: entity.getUserSnapshot().userAuthId,
      handle: entity.getUserSnapshot().handle,
      email: entity.getUserSnapshot().email,
      dob: entity.getUserSnapshot().dob ?? null,
      phoneNumber: entity.getUserSnapshot().phoneNumber ?? null,
      isPhoneNumberVerified: entity.getUserSnapshot().isPhoneNumbetVerified,
      notification: entity.getUserSnapshot().notification,
      languagePreference: entity.getUserSnapshot().languagePreference,
      onBoardingComplete: entity.getUserSnapshot().isOnBoardingComplete,
      themePreference: entity.getUserSnapshot().themePreference,
      region: entity.getUserSnapshot().region,
    };
  }
}
