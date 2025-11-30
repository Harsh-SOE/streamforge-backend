import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { LogExecutionTime } from '@app/utils';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { DatabaseFilter, DatabaseQueryFilter } from '@app/common/types';

import { VideoQueryRepositoryPort } from '@videos/application/ports';
import { VideoQueryModel } from '@videos/query-model';
import { PersistanceService } from '@videos/infrastructure/persistance/adapter';
import { VideoQueryPeristanceACL } from '@videos/infrastructure/anti-corruption';
import { VideoNotFoundException } from '@videos/application/exceptions';

import { Prisma, Video } from '@peristance/videos';

@Injectable()
export class VideoQueryRepositoryAdapter implements VideoQueryRepositoryPort {
  constructor(
    @Inject(forwardRef(() => VideoQueryPeristanceACL))
    private readonly videoQueryPersistanceACL: VideoQueryPeristanceACL,
    private readonly persistanceService: PersistanceService,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
  ) {}

  toPrismaFilter(
    filter: DatabaseFilter<Video>,
    mode: 'many' | 'unique',
  ): Prisma.VideoWhereInput | Prisma.VideoWhereUniqueInput {
    const prismaFilter: Prisma.VideoWhereInput | Prisma.VideoWhereUniqueInput =
      {};

    (Object.keys(filter) as Array<keyof Video>).forEach((key) => {
      const value = filter[key];
      if (value !== undefined) {
        prismaFilter[key as string] = value;
      }
    });

    if (mode === 'unique') return prismaFilter;

    if (filter.and) {
      prismaFilter.AND = filter.and.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    if (filter.or) {
      prismaFilter.OR = filter.or.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    if (filter.not) {
      prismaFilter.NOT = filter.not.map((filterCondition) => ({
        [filterCondition.field]: {
          [filterCondition.operator]: [filterCondition.value],
        },
      }));
    }

    return prismaFilter;
  }

  @LogExecutionTime()
  async findOne(filter: DatabaseFilter<Video>): Promise<VideoQueryModel> {
    const findVideoOperation = async () => {
      return await this.persistanceService.video.findUnique({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.VideoWhereUniqueInput,
      });
    };

    const foundVideo = await this.prismaDatabaseHandler.filter(
      findVideoOperation,
      {
        operationType: 'CREATE',
        entry: {},
      },
    );

    if (!foundVideo) {
      throw new VideoNotFoundException({
        message: `Video with filter: ${JSON.stringify(filter)} was not found in the database`,
      });
    }

    return this.videoQueryPersistanceACL.toQueryModel(foundVideo);
  }

  async QueryVideos(
    filter: DatabaseFilter<Video>,
    queryOptions?: DatabaseQueryFilter<Video>,
  ): Promise<VideoQueryModel[]> {
    const findVideosOperation = async () => {
      return await this.persistanceService.video.findMany({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.VideoWhereUniqueInput,
        take: queryOptions?.limit,
        skip: queryOptions?.skip,
        orderBy: queryOptions?.orderBy,
      });
    };

    const foundVideos = await this.prismaDatabaseHandler.filter(
      findVideosOperation,
      {
        operationType: 'READ',
        filter,
      },
    );

    if (!foundVideos) {
      throw new VideoNotFoundException({
        message: `Video with filter: ${JSON.stringify(filter)} was not found in the database`,
      });
    }

    return foundVideos.map((video) =>
      this.videoQueryPersistanceACL.toQueryModel(video),
    );
  }

  async findOneByid(id: string): Promise<VideoQueryModel> {
    const findVideoOperation = async () => {
      return await this.persistanceService.video.findUnique({
        where: { id },
      });
    };

    const foundVideo = await this.prismaDatabaseHandler.filter(
      findVideoOperation,
      {
        operationType: 'CREATE',
        entry: {},
      },
    );

    if (!foundVideo) {
      throw new VideoNotFoundException({
        message: `Video with id: ${id} was not found in the database`,
      });
    }

    return this.videoQueryPersistanceACL.toQueryModel(foundVideo);
  }
}
