import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PrismaHandler } from '@app/handlers/database/prisma';

import { ViewAggregate } from '@views/domain/aggregates';
import { ViewRepositoryPort } from '@views/application/ports';
import { ViewPeristanceAggregateACL } from '@views/infrastructure/anti-corruption';

import { PRISMA_CLIENT, PrismaDBClient } from '@app/clients/prisma';
import { PrismaClient as ViewPrismaClient } from '@persistance/views';

@Injectable()
export class ViewRepositoryAdapter implements ViewRepositoryPort {
  public constructor(
    private readonly databaseHandler: PrismaHandler,
    private readonly viewPersistanceACL: ViewPeristanceAggregateACL,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaDBClient<ViewPrismaClient>,
  ) {}

  public async save(model: ViewAggregate): Promise<ViewAggregate> {
    const createdEntity = await this.prisma.client.view.create({
      data: this.viewPersistanceACL.toPersistance(model),
    });
    return this.viewPersistanceACL.toAggregate(createdEntity);
  }

  public async saveMany(models: ViewAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const dataToCreate = models.map((model) => this.viewPersistanceACL.toPersistance(model));
    this.logger.info(`Saving: ${dataToCreate.length} documents into the database as a batch`, {
      component: Components.DATABASE,
      service: 'VIEW',
    });
    const createdEntitiesFunc = async () =>
      await this.prisma.client.view.createMany({
        data: models.map((model) => this.viewPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.databaseHandler.execute(createdEntitiesFunc, {
      operationType: 'CREATE',
      entity: dataToCreate,
    });
    return createdEntities.count;
  }
}
