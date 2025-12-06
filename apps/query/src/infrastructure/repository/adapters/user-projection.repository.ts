import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { UserQueryACL } from '@query/infrastructure/anti-corruption';
import { UserQueryRepositoryPort } from '@query/application/ports';
import { UserQueryModel } from '@query/queries/models';

import { ProjectedUserQueryModel } from '../models';

@Injectable()
export class UserQueryRepository implements UserQueryRepositoryPort {
  constructor(
    @InjectModel(ProjectedUserQueryModel.name)
    private readonly projectedUserInfo: Model<ProjectedUserQueryModel>,
    private readonly userQueryACL: UserQueryACL,
  ) {}

  public async getUserFromId(userId: string): Promise<UserQueryModel | null> {
    const user = await this.projectedUserInfo.findById(userId);

    return user
      ? this.userQueryACL.userProjectionSchemaToQueryModel(user)
      : null;
  }

  public async getUserFromAuthId(
    userAuthId: string,
  ): Promise<UserQueryModel | null> {
    const user = await this.projectedUserInfo.findOne({ userAuthId });

    return user
      ? this.userQueryACL.userProjectionSchemaToQueryModel(user)
      : null;
  }
}
