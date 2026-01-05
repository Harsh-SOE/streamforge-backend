import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  OnboardedIntegrationEvent,
  ProfileUpdatedIntegrationEvent,
} from '@app/common/events/users';

import { UserProjectionModel } from '@projection/infrastructure/repository/models';

@Injectable()
export class UserProjectionACL {
  public constructor(
    @InjectModel(UserProjectionModel.name)
    private readonly userCard: Model<UserProjectionModel>,
  ) {}

  public userProfileCreatedEventToPersistance(
    event: OnboardedIntegrationEvent,
  ): UserProjectionModel {
    const { authId, userId, email, handle } = event.payload;
    const userCard = {
      userId,
      email,
      handle,
      userAuthId: authId,
    };

    return new this.userCard(userCard);
  }

  public userProfileUpdatedEventToPersistance(
    event: ProfileUpdatedIntegrationEvent,
  ): UserProjectionModel {
    const { userId, avatar, dob } = event.payload;

    const userCard = {
      userId,
      avatar,
      dob,
    };

    return new this.userCard(userCard);
  }
}
