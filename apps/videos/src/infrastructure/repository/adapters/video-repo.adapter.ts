import { Inject, Injectable } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { VideoAggregate } from '@videos/domain/aggregates';
import { VideoRepositoryPort } from '@videos/application/ports';
import { VideoPrismaClient } from '@videos/infrastructure/clients/prisma';
import { VideoAggregatePersistanceACL } from '@videos/infrastructure/anti-corruption';
import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';

@Injectable()
export class VideoRepositoryAdapter implements VideoRepositoryPort {
  public constructor(
    private readonly videoPersistanceACL: VideoAggregatePersistanceACL,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    private videoPrismaClient: VideoPrismaClient,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public async saveVideo(model: VideoAggregate): Promise<VideoAggregate> {
    const createdEntityFunc = async () =>
      await this.videoPrismaClient.video.create({
        data: this.videoPersistanceACL.toPersistance(model),
      });
    const createdEntity = await this.prismaDatabaseHandler.execute(createdEntityFunc, {
      operationType: 'CREATE',
      entry: this.videoPersistanceACL.toPersistance(model),
    });
    return this.videoPersistanceACL.toAggregate(createdEntity);
  }

  public async saveManyVideos(models: VideoAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const videosToCreate = models.map((model) => this.videoPersistanceACL.toPersistance(model));

    const createVideosOperation = async () =>
      await this.videoPrismaClient.video.createMany({
        data: models.map((model) => this.videoPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.prismaDatabaseHandler.execute(createVideosOperation, {
      operationType: 'CREATE',
      entry: videosToCreate,
    });

    return createdEntities.count;
  }

  public async updateVideoPublishStatusById(
    id: string,
    updatedPublishStatus: VideoDomainPublishStatus,
  ): Promise<VideoAggregate> {
    const updatePublishStatusOperation = async () =>
      await this.videoPrismaClient.video.update({
        where: { id },
        data: { videoPublishStatus: updatedPublishStatus },
      });

    const updatedLike = await this.prismaDatabaseHandler.execute(updatePublishStatusOperation, {
      operationType: 'UPDATE',
      entry: { updatedPublishStatus },
      filter: { id },
    });

    return this.videoPersistanceACL.toAggregate(updatedLike);
  }

  public async updateVideoVisibilityStatusById(
    id: string,
    updatedVisibilityStatus: VideoDomainVisibiltyStatus,
  ): Promise<VideoAggregate> {
    const updateVisibilityOperation = async () =>
      await this.videoPrismaClient.video.update({
        where: { id },
        data: { videoVisibiltyStatus: updatedVisibilityStatus },
      });

    const updatedLike = await this.prismaDatabaseHandler.execute(updateVisibilityOperation, {
      operationType: 'UPDATE',
      entry: { updatedVisibilityStatus },
      filter: { id },
    });

    return this.videoPersistanceACL.toAggregate(updatedLike);
  }

  async findOneVideoById(id: string): Promise<VideoAggregate | undefined> {
    const findVideoOperation = async () => {
      return await this.videoPrismaClient.video.findUnique({
        where: { id },
      });
    };

    const foundVideo = await this.prismaDatabaseHandler.execute(findVideoOperation, {
      operationType: 'CREATE',
      entry: {},
    });

    return foundVideo ? this.videoPersistanceACL.toAggregate(foundVideo) : undefined;
  }

  public async updateOneVideoById(
    id: string,
    newVideoModel: VideoAggregate,
  ): Promise<VideoAggregate> {
    const videoEntity = newVideoModel.getVideoEntity();
    const updatedLikesOperation = async () =>
      await this.videoPrismaClient.video.update({
        where: { id },
        data: {
          videoFileIdentifier: videoEntity.getVideoFileIdentifier(),
          videoThumbnailIdentifer: videoEntity.getVideoThumbnailIdentifier(),
          categories: videoEntity.getCategories(),
          description: videoEntity.getDescription(),
          videoPublishStatus: videoEntity.getPublishStatus(),
          videoVisibiltyStatus: videoEntity.getVisibiltyStatus(),
          title: videoEntity.getTitle(),
        },
      });

    const updatedVideo = await this.prismaDatabaseHandler.execute(updatedLikesOperation, {
      operationType: 'UPDATE',
      entry: {},
      filter: { id },
    });

    return this.videoPersistanceACL.toAggregate(updatedVideo);
  }
}
