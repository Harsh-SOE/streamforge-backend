import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common';
import { PrismaDBClient } from '@app/clients/prisma';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PrismaHandler } from '@app/handlers/database/prisma';

import { CommentAggregate } from '@comments/domain/aggregates';
import { CommentRepositoryPort } from '@comments/application/ports';
import { CommentAggregatePersistance } from '@comments/infrastructure/anti-corruption';

import { PrismaClient as CommentsPrismaClient } from '@persistance/comments';

@Injectable()
export class PrismaMongoDBRepositoryAdapter implements CommentRepositoryPort {
  public constructor(
    private readonly commentPersistanceACL: CommentAggregatePersistance,
    private readonly prismaDatabaseHandler: PrismaHandler,
    private readonly prisma: PrismaDBClient<CommentsPrismaClient>,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async save(model: CommentAggregate): Promise<CommentAggregate> {
    const createdEntity = await this.prisma.client.comment.create({
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
      await this.prisma.client.comment.createMany({
        data: models.map((model) => this.commentPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.prismaDatabaseHandler.execute(createdEntitiesFunc, {
      operationType: 'CREATE',
      entity: dataToCreate,
    });
    return createdEntities.count;
  }

  public async updateOneById(id: string, newCommentText: string): Promise<CommentAggregate> {
    const updateLikeOperation = async () =>
      await this.prisma.client.comment.update({
        where: { id },
        data: { commentText: newCommentText },
      });

    const updatedLike = await this.prismaDatabaseHandler.execute(updateLikeOperation, {
      operationType: 'UPDATE',
      entity: {},
      filter: { newCommentText },
    });

    return this.commentPersistanceACL.toAggregate(updatedLike);
  }
}
