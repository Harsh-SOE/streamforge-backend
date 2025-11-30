import { Injectable } from '@nestjs/common';

import { IQueryPersistanceACL } from '@app/ports/anti-corruption';

import { UserQueryModel } from '@users/application/queries';

import { User } from '@peristance/user';

@Injectable()
export class UserQueryPersistanceACL implements IQueryPersistanceACL<
  UserQueryModel,
  Omit<User, 'createdAt' | 'updatedAt'>
> {
  public toQueryModel(
    persistance: Omit<User, 'createdAt' | 'updatedAt'>,
  ): UserQueryModel {
    return {
      id: persistance.id,
      authUserId: persistance.authUserId,
      dob: persistance.dob,
      email: persistance.email,
      handle: persistance.handle,
      isPhoneNumberVerified: persistance.isPhoneNumberVerified,
      languagePreference: persistance.languagePreference,
      notification: persistance.notification,
      onBoardingComplete: persistance.onBoardingComplete,
      phoneNumber: persistance.phoneNumber,
      region: persistance.region,
      themePreference: persistance.themePreference,
    };
  }

  public toPersistance(
    entity: UserQueryModel,
  ): Omit<User, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      authUserId: entity.authUserId,
      handle: entity.handle,
      email: entity.email,
      dob: entity.dob,
      phoneNumber: entity.phoneNumber,
      isPhoneNumberVerified: entity.isPhoneNumberVerified,
      notification: entity.notification,
      languagePreference: entity.languagePreference,
      onBoardingComplete: entity.onBoardingComplete,
      themePreference: entity.themePreference,
      region: entity.region,
    };
  }
}
