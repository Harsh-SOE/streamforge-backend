import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import {
  OnboardedIntegrationEvent,
  ProfileUpdatedIntegrationEvent,
} from '@app/common/events/users';

import { UserProjectionRepositoryPort } from '@projection/application/ports';
import { UserProjectionACL } from '@projection/infrastructure/anti-corruption';

import { UserProjectionModel } from '../models';

@Injectable()
export class UserProjectionRepository implements UserProjectionRepositoryPort {
  constructor(
    @InjectModel(UserProjectionModel.name)
    private readonly projectedVideoCard: Model<UserProjectionModel>,
    private readonly userCardACL: UserProjectionACL,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async saveUser(data: OnboardedIntegrationEvent): Promise<boolean> {
    this.logger.info(`User will be saved as`, data);

    await this.projectedVideoCard.create(
      this.userCardACL.userProfileCreatedEventToPersistance(data),
    );

    return true;
  }

  async saveManyUser(event: OnboardedIntegrationEvent[]): Promise<number> {
    const data = event.map((data) => this.userCardACL.userProfileCreatedEventToPersistance(data));
    const savedCards = await this.projectedVideoCard.insertMany(data);

    return savedCards.length;
  }

  public async updateUser(
    videoId: string,
    event: ProfileUpdatedIntegrationEvent,
  ): Promise<boolean> {
    const updated = await this.projectedVideoCard.findOneAndUpdate(
      { videoId },
      { $set: this.userCardACL.userProfileUpdatedEventToPersistance(event) },
      { new: true },
    );

    return updated ? true : false;
  }

  public async deleteUser(videoId: string): Promise<boolean> {
    const result = await this.projectedVideoCard.deleteOne({ videoId });
    return result.acknowledged;
  }
}
