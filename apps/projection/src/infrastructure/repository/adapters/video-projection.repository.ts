import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { VideoUploadedEventDto } from '@app/contracts/videos';

import { VideoProjectionRepositoryPort } from '@projection/application/ports';
import { VideoProjectionACL } from '@projection/infrastructure/anti-corruption';

import { VideoWatchProjectionModel } from '../models';

@Injectable()
export class VideoProjectionRepository implements VideoProjectionRepositoryPort {
  constructor(
    @InjectModel(VideoWatchProjectionModel.name)
    private readonly projectedVideoCard: Model<VideoWatchProjectionModel>,
    private readonly videoCardACL: VideoProjectionACL,
  ) {}

  public async saveVideo(data: VideoUploadedEventDto): Promise<boolean> {
    await this.projectedVideoCard.create(this.videoCardACL.videoUploadedEventToPersistance(data));

    return true;
  }

  async saveManyVideos(event: VideoUploadedEventDto[]): Promise<number> {
    const data = event.map((data) => this.videoCardACL.videoUploadedEventToPersistance(data));
    const savedCards = await this.projectedVideoCard.insertMany(data);

    return savedCards.length;
  }

  public async updateVideo(videoId: string, event: VideoUploadedEventDto): Promise<boolean> {
    const updated = await this.projectedVideoCard.findOneAndUpdate(
      { videoId },
      { $set: this.videoCardACL.videoUpdatedEventToPersistance(event) },
      { new: true },
    );

    return updated ? true : false;
  }

  public async deleteVideo(videoId: string): Promise<boolean> {
    const result = await this.projectedVideoCard.deleteOne({ videoId });
    return result.acknowledged;
  }
}
