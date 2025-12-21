import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UserQueryModel } from '@query/queries/models';
import { UserQueryRepositoryPort } from '@query/application/ports';
import { UserQueryACL } from '@query/infrastructure/anti-corruption';

import { UserProjectionModel } from '../models';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

@Injectable()
export class UserQueryRepository implements UserQueryRepositoryPort {
  constructor(
    @InjectModel(UserProjectionModel.name)
    private readonly projectedUserInfo: Model<UserProjectionModel>,
    private readonly userQueryACL: UserQueryACL,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async getUserFromId(userId: string): Promise<UserQueryModel | null> {
    const user = await this.projectedUserInfo.findById(userId);

    return user ? this.userQueryACL.userProjectionSchemaToQueryModel(user) : null;
  }

  public async getUserFromAuthId(userAuthId: string): Promise<UserQueryModel | null> {
    this.logger.info(`AuthId is: ${userAuthId}`);

    const user = await this.projectedUserInfo.findOne({ userAuthId: userAuthId });

    this.logger.info(`User is`, user?.toObject());

    return user ? this.userQueryACL.userProjectionSchemaToQueryModel(user) : null;
  }
}
