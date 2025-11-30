import { Inject, Injectable } from '@nestjs/common';

import { DatabaseFilter } from '@app/common/types';
import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { ViewRepositoryPort } from '@views/application/ports';
import { ViewAggregate } from '@views/domain/aggregates';
import { PersistanceService } from '@views/infrastructure/persistance/adapter';
import { ViewPeristanceAggregateACL } from '@views/infrastructure/anti-corruption';

import { Prisma, View } from '@persistance/views';

@Injectable()
export class ViewRepositoryAdapter implements ViewRepositoryPort {
  public constructor(
    private readonly viewPersistanceACL: ViewPeristanceAggregateACL,
    private readonly databaseHandler: PrismaDatabaseHandler,
    private readonly persistanceService: PersistanceService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public toPrismaFilter(
    filter: DatabaseFilter<View>,
    mode: 'many' | 'unique',
  ): Prisma.ViewWhereInput | Prisma.ViewWhereUniqueInput {
    const prismaFilter: Prisma.ViewWhereInput | Prisma.ViewWhereUniqueInput =
      {};

    (Object.keys(filter) as Array<keyof View>).forEach((key) => {
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

  public async save(model: ViewAggregate): Promise<ViewAggregate> {
    const createdEntity = await this.persistanceService.view.create({
      data: this.viewPersistanceACL.toPersistance(model),
    });
    return this.viewPersistanceACL.toAggregate(createdEntity);
  }

  public async saveMany(models: ViewAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const dataToCreate = models.map((model) =>
      this.viewPersistanceACL.toPersistance(model),
    );
    this.logger.info(
      `Saving: ${dataToCreate.length} documents into the database as a batch`,
      {
        component: Components.DATABASE,
        service: 'VIEW',
      },
    );
    const createdEntitiesFunc = async () =>
      await this.persistanceService.view.createMany({
        data: models.map((model) =>
          this.viewPersistanceACL.toPersistance(model),
        ),
      });

    const createdEntities = await this.databaseHandler.filter(
      createdEntitiesFunc,
      { operationType: 'CREATE', entry: dataToCreate },
    );
    return createdEntities.count;
  }
}
