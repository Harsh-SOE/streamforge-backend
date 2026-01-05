import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { UserAggregate } from '@users/domain/aggregates';

import { User } from '@persistance/users';

@Injectable()
export class UserAggregatePersistanceACL implements IAggregatePersistanceACL<
  UserAggregate,
  Omit<User, 'createdAt' | 'updatedAt'>
> {
  public toAggregate(persistance: Omit<User, 'createdAt' | 'updatedAt'>): UserAggregate {
    return UserAggregate.create({
      id: persistance.id,
      userAuthId: persistance.authUserId,
      handle: persistance.handle,
      email: persistance.email,
      avatarUrl: persistance.avatar,
      dob: persistance.dob ?? undefined,
      phoneNumber: persistance.phoneNumber ?? undefined,
      isPhoneNumberVerified: persistance.isPhoneNumberVerified,
      notification: persistance.notification,
      preferredTheme: persistance.themePreference,
      preferredLanguage: persistance.languagePreference,
      region: persistance.region,
    });
  }
  public toPersistance(aggregate: UserAggregate): Omit<User, 'createdAt' | 'updatedAt'> {
    const aggregateSnapshot = aggregate.getUserSnapshot();

    return {
      id: aggregateSnapshot.id,
      authUserId: aggregateSnapshot.userAuthId,
      handle: aggregateSnapshot.handle,
      email: aggregateSnapshot.email,
      avatar: aggregateSnapshot.avatarUrl,
      dob: aggregateSnapshot.dob ?? null,
      phoneNumber: aggregateSnapshot.phoneNumber ?? null,
      isPhoneNumberVerified: aggregateSnapshot.isPhoneNumbetVerified,
      notification: aggregateSnapshot.notification,
      languagePreference: aggregateSnapshot.languagePreference,
      themePreference: aggregateSnapshot.themePreference,
      region: aggregateSnapshot.region,
    };
  }
}
