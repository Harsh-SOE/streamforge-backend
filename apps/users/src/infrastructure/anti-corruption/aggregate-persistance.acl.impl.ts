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
  UserAvatarUrl,
  UserId,
} from '@users/domain/value-objects';
import { UserAggregate } from '@users/domain/aggregates';
import { UserEntity } from '@users/domain/entities';

import { User } from '@persistance/users';

@Injectable()
export class UserAggregatePersistanceACL implements IAggregatePersistanceACL<
  UserAggregate,
  Omit<User, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(
    persistance: Omit<User, 'createdAt' | 'updatedAt'>,
  ): UserAggregate {
    const user = new UserEntity({
      id: UserId.create(persistance.id),
      userAuthId: persistance.authUserId,
      handle: UserHandle.create(persistance.handle),
      email: UserEmail.create(persistance.email),
      avatarUrl: UserAvatarUrl.create(persistance.avatar),
      dob: UserDOB.create(persistance.dob ?? undefined),
      phoneNumber: UserPhoneNumber.create(persistance.phoneNumber ?? undefined),
      isPhoneNumberVerified: persistance.isPhoneNumberVerified,
      notification: persistance.notification,
      themePreference: UserThemePreference.create(persistance.themePreference),
      languagePreference: UserLanguagePreference.create(
        persistance.languagePreference,
      ),
      region: UserRegion.create(persistance.region),
    });
    return new UserAggregate(user);
  }
  public toPersistance(
    aggregate: UserAggregate,
  ): Omit<User, 'createdAt' | 'updatedAt'> {
    return {
      id: aggregate.getUserSnapshot().id,
      authUserId: aggregate.getUserSnapshot().userAuthId,
      handle: aggregate.getUserSnapshot().handle,
      email: aggregate.getUserSnapshot().email,
      avatar: aggregate.getUserSnapshot().avatarUrl,
      dob: aggregate.getUserSnapshot().dob ?? null,
      phoneNumber: aggregate.getUserSnapshot().phoneNumber ?? null,
      isPhoneNumberVerified: aggregate.getUserSnapshot().isPhoneNumbetVerified,
      notification: aggregate.getUserSnapshot().notification,
      languagePreference: aggregate.getUserSnapshot().languagePreference,
      themePreference: aggregate.getUserSnapshot().themePreference,
      region: aggregate.getUserSnapshot().region,
    };
  }
}
