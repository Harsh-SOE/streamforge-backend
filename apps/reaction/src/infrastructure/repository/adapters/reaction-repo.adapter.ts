import { Inject, Injectable } from '@nestjs/common';

import { DatabaseFilter } from '@app/common/types';
import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { ReactionRepositoryPort } from '@reaction/application/ports';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { ReactionDomainStatus } from '@reaction/domain/enums';
import { PersistanceService } from '@reaction/infrastructure/persistance/adapter';
import { ReactionPersistanceACL } from '@reaction/infrastructure/anti-corruption';

import { Prisma, VideoReactions } from '@peristance/reaction';

@Injectable()
export class ReactionRepositoryAdapter implements ReactionRepositoryPort {
  public constructor(
    private reactionPersistanceACL: ReactionPersistanceACL,
    private readonly reactionRepoFilter: PrismaDatabaseHandler,
    private persistanceService: PersistanceService,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public toPrismaFilter(
    filter: DatabaseFilter<VideoReactions>,
    mode: 'many' | 'unique',
  ): Prisma.VideoReactionsWhereInput | Prisma.VideoReactionsWhereUniqueInput {
    const prismaFilter: Prisma.VideoReactionsWhereInput | Prisma.VideoReactionsWhereUniqueInput =
      {};

    (Object.keys(filter) as Array<keyof VideoReactions>).forEach((key) => {
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

  public async save(model: ReactionAggregate): Promise<ReactionAggregate> {
    const createdEntity = await this.persistanceService.videoReactions.create({
      data: this.reactionPersistanceACL.toPersistance(model),
    });
    return this.reactionPersistanceACL.toAggregate(createdEntity);
  }

  public async saveMany(models: ReactionAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const dataToCreate = models.map((model) => this.reactionPersistanceACL.toPersistance(model));
    this.logger.info(`Saving: ${dataToCreate.length} documents into the database as a batch`, {
      component: Components.DATABASE,
      service: 'REACTION',
    });
    const createdEntitiesFunc = async () =>
      await this.persistanceService.videoReactions.createMany({
        data: models.map((model) => this.reactionPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.reactionRepoFilter.execute(createdEntitiesFunc, {
      operationType: 'CREATE',
      entry: dataToCreate,
    });
    return createdEntities.count;
  }

  public async update(
    filter: DatabaseFilter<VideoReactions>,
    newReactionStatus: ReactionDomainStatus,
  ): Promise<ReactionAggregate> {
    const updateReactionOperation = async () =>
      await this.persistanceService.videoReactions.update({
        where: this.toPrismaFilter(filter, 'unique') as Prisma.VideoReactionsWhereUniqueInput,
        data: { reactionStatus: newReactionStatus },
      });

    const updatedReaction = await this.reactionRepoFilter.execute(updateReactionOperation, {
      operationType: 'UPDATE',
      entry: {},
      filter: { newReactionStatus: newReactionStatus },
    });

    return this.reactionPersistanceACL.toAggregate(updatedReaction);
  }

  public async updateMany(
    filter: DatabaseFilter<VideoReactions>,
    newReactionStatus: ReactionDomainStatus,
  ): Promise<number> {
    const updatedReactionsOperation = async () =>
      await this.persistanceService.videoReactions.updateMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.VideoReactionsWhereInput,
        data: { reactionStatus: newReactionStatus },
      });

    const updatedReactions = await this.reactionRepoFilter.execute(updatedReactionsOperation, {
      operationType: 'UPDATE',
      entry: {},
      filter,
    });

    return updatedReactions.count;
  }
}
