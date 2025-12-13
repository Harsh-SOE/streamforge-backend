import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UserProfileCreatedEventDto, UserProfileUpdatedEventDto } from '@app/contracts/users';

import { ProjectedUserQueryModel } from '@projection/infrastructure/repository/models';

@Injectable()
export class UserCardACL {
  public constructor(
    @InjectModel(ProjectedUserQueryModel.name)
    private readonly userCard: Model<ProjectedUserQueryModel>,
  ) {}

  public userProfileCreatedEventToPersistance(
    event: UserProfileCreatedEventDto,
  ): ProjectedUserQueryModel {
    const userCard = {
      userId: event.id,
      userAuthId: event.userAuthId,
      email: event.email,
      handle: event.handle,
      avatar: event.avatar,
      dob: event.dob,
      phoneNumber: event.phoneNumber,
      isPhoneNumberVerified: event.isPhoneNumberVerified || false,
    };

    return new this.userCard(userCard);
  }

  public userProfileUpdatedEventToPersistance(
    event: UserProfileUpdatedEventDto,
  ): ProjectedUserQueryModel {
    const userCard = {
      userId: event.id,
      avatar: event.avatar,
      dob: event.dob,
    };

    return new this.userCard(userCard);
  }
}
