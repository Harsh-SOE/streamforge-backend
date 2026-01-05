import { Injectable } from '@nestjs/common';

import { UserQueryModel } from '@query/queries/models';
import { UserProjectionModel } from '@query/infrastructure/repository/models';

@Injectable()
export class UserQueryACL {
  public userProjectionSchemaToQueryModel(projectionModel: UserProjectionModel): UserQueryModel {
    return {
      userId: projectionModel.userId,
      userAuthId: projectionModel.userAuthId,
      email: projectionModel.email,
      userName: projectionModel.userName,
      handle: projectionModel.handle,
      avatar: projectionModel.avatar,
      dob: projectionModel.dob,
      phoneNumber: projectionModel.phoneNumber,
      isPhoneNumberVerified: projectionModel.isPhoneNumberVerified,
      hasChannel: projectionModel.hasChannel,
    };
  }
}
