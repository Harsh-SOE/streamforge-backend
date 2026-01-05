import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common';
import { PrismaDBClient } from '@app/clients/prisma';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PrismaHandler } from '@app/handlers/database/prisma';

import { ReactionDomainStatus } from '@reaction/domain/enums';
import { ReactionAggregate } from '@reaction/domain/aggregates';
import { ReactionRepositoryPort } from '@reaction/application/ports';
import { ReactionAggregatePersistanceACL } from '@reaction/infrastructure/anti-corruption';

import { PrismaClient } from '@persistance/reaction';

@Injectable()
export class ReactionRepositoryAdapter implements ReactionRepositoryPort {
  public constructor(
    private reactionPersistanceACL: ReactionAggregatePersistanceACL,
    private readonly reactionRepoFilter: PrismaHandler,
    private prisma: PrismaDBClient<PrismaClient>,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public async saveReaction(model: ReactionAggregate): Promise<ReactionAggregate> {
    const createdEntity = await this.prisma.client.videoReactions.create({
      data: this.reactionPersistanceACL.toPersistance(model),
    });
    return this.reactionPersistanceACL.toAggregate(createdEntity);
  }

  public async saveManyReaction(models: ReactionAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const dataToCreate = models.map((model) => this.reactionPersistanceACL.toPersistance(model));
    this.logger.info(`Saving: ${dataToCreate.length} documents into the database as a batch`, {
      component: Components.DATABASE,
      service: 'REACTION',
    });
    const createdEntitiesFunc = async () =>
      await this.prisma.client.videoReactions.createMany({
        data: models.map((model) => this.reactionPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.reactionRepoFilter.execute(createdEntitiesFunc, {
      operationType: 'CREATE',
      entity: dataToCreate,
    });
    return createdEntities.count;
  }

  public async updateOneReactionById(
    id: string,
    newReactionStatus: ReactionDomainStatus,
  ): Promise<ReactionAggregate> {
    const updateReactionOperation = async () =>
      await this.prisma.client.videoReactions.update({
        where: { id },
        data: { reactionStatus: newReactionStatus },
      });

    const updatedReaction = await this.reactionRepoFilter.execute(updateReactionOperation, {
      operationType: 'UPDATE',
      entity: {},
      filter: { newReactionStatus: newReactionStatus },
    });

    return this.reactionPersistanceACL.toAggregate(updatedReaction);
  }

  public async updateOneReactionByUserAndVideoId(
    data: { userId: string; videoId: string },
    newReactionStatus: ReactionDomainStatus,
  ): Promise<ReactionAggregate> {
    const { userId, videoId } = data;
    const updateReactionOperation = async () =>
      await this.prisma.client.videoReactions.update({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        data: { reactionStatus: newReactionStatus },
      });

    const updatedReaction = await this.reactionRepoFilter.execute(updateReactionOperation, {
      operationType: 'UPDATE',
      entity: {},
      filter: { newReactionStatus: newReactionStatus },
    });

    return this.reactionPersistanceACL.toAggregate(updatedReaction);
  }
}
