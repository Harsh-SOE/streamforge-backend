import { Inject, Injectable } from '@nestjs/common';

import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { DatabaseFilter } from '@app/common/types';
import { Components } from '@app/common/components';

import { CommentRepositoryPort } from '@comments/application/ports';
import { CommentAggregate } from '@comments/domain/aggregates';
import { PersistanceService } from '@comments/infrastructure/persistance/adapter';
import { CommentAggregatePersistance } from '@comments/infrastructure/anti-corruption';

import { Prisma } from '@peristance/comments';

@Injectable()
export class PrismaMongoDBRepositoryAdapter implements CommentRepositoryPort {
  public constructor(
    private readonly commentPersistanceACL: CommentAggregatePersistance,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    private readonly persistanceService: PersistanceService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public toPrismaFilter(
    filter: DatabaseFilter<Comment>,
    mode: 'many' | 'unique',
  ): Prisma.CommentWhereInput | Prisma.CommentWhereUniqueInput {
    const prismaFilter: Prisma.CommentWhereInput | Prisma.CommentWhereUniqueInput = {};

    (Object.keys(filter) as Array<keyof Comment>).forEach((key) => {
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

  public async save(model: CommentAggregate): Promise<CommentAggregate> {
    const createdEntity = await this.persistanceService.comment.create({
      data: this.commentPersistanceACL.toPersistance(model),
    });
    return this.commentPersistanceACL.toAggregate(createdEntity);
  }

  public async saveMany(models: CommentAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const dataToCreate = models.map((model) => this.commentPersistanceACL.toPersistance(model));
    this.logger.info(`Saving: ${dataToCreate.length} documents into the database as a batch`, {
      component: Components.DATABASE,
      service: 'COMMENTS',
    });
    const createdEntitiesFunc = async () =>
      await this.persistanceService.comment.createMany({
        data: models.map((model) => this.commentPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.prismaDatabaseHandler.execute(createdEntitiesFunc, {
      operationType: 'CREATE',
      entry: dataToCreate,
    });
    return createdEntities.count;
  }

  public async update(
    filter: DatabaseFilter<Comment>,
    newCommentText: string,
  ): Promise<CommentAggregate> {
    const updateLikeOperation = async () =>
      await this.persistanceService.comment.update({
        where: this.toPrismaFilter(filter, 'unique') as Prisma.CommentWhereUniqueInput,
        data: { commentText: newCommentText },
      });

    const updatedLike = await this.prismaDatabaseHandler.execute(updateLikeOperation, {
      operationType: 'UPDATE',
      entry: {},
      filter: { newCommentText },
    });

    return this.commentPersistanceACL.toAggregate(updatedLike);
  }

  public async updateMany(
    filter: DatabaseFilter<Comment>,
    newCommentText: string,
  ): Promise<number> {
    const updatedLikesOperation = async () =>
      await this.persistanceService.comment.updateMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.CommentWhereInput,
        data: { commentText: newCommentText },
      });

    const updatedLikes = await this.prismaDatabaseHandler.execute(updatedLikesOperation, {
      operationType: 'UPDATE',
      entry: {},
      filter,
    });

    return updatedLikes.count;
  }
}
