import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { UserReadModel } from '@read/application/models';
import { UserQueryRepositoryPort } from '@read/application/ports';
import { UserQueryACL } from '@read/infrastructure/anti-corruption';
import { UserReadMongooseModel } from '@read/infrastructure/repository/models';

@Injectable()
export class UserQueryRepository implements UserQueryRepositoryPort {
  constructor(
    @InjectModel(UserReadMongooseModel.name)
    private readonly projectedUserInfo: Model<UserReadMongooseModel>,
    private readonly userQueryACL: UserQueryACL,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async getUserFromId(userId: string): Promise<UserReadModel | null> {
    const user = await this.projectedUserInfo.findOne({ userId });

    return user ? this.userQueryACL.userProjectionSchemaToQueryModel(user) : null;
  }

  public async getUserFromAuthId(userAuthId: string): Promise<UserReadModel | null> {
    this.logger.info(`AuthId is: ${userAuthId}`);

    const user = await this.projectedUserInfo.findOne({ userAuthId: userAuthId });

    this.logger.info(`User is`, user?.toObject());

    return user ? this.userQueryACL.userProjectionSchemaToQueryModel(user) : null;
  }
}
