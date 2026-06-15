import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { VideoProjectionRepositoryPort } from '@read/application/ports';
import { VideoIntegrationToProjectionACL } from '@read/infrastructure/anti-corruption';
import { VideoWatchReadMongooseModel } from '@read/infrastructure/repository/models';

import { VideoCreatorReadModel } from '../../models/videos';

@Injectable()
export class VideoProjectionRepository implements VideoProjectionRepositoryPort {
  constructor(
    @InjectModel(VideoWatchReadMongooseModel.name)
    private readonly videoProjectionModel: Model<VideoWatchReadMongooseModel>,
    private readonly videoIntegrationToProjectionACL: VideoIntegrationToProjectionACL,
  ) {}

  public async saveCreatorVideo(data: VideoCreatorReadModel): Promise<boolean> {
    await this.videoProjectionModel.create(data);
    return true;
  }
}
