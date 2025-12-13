import { Injectable } from '@nestjs/common';

import { LogExecutionTime } from '@app/utils';
import { DatabaseFilter } from '@app/common/types';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { ChannelQueryRepositoryPort } from '@channel/application/ports';
import { ChannelQueryModel } from '@channel/application/queries';
import { PersistanceService } from '@channel/infrastructure/persistance/adapter';
import { ChannelQueryPersistanceACL } from '@channel/infrastructure/anti-corruption';

import { Prisma, Channel } from '@peristance/channel';

@Injectable()
export class ChannelQueryRepositoryAdapter implements ChannelQueryRepositoryPort {
  constructor(
    private readonly queryPersistanceACL: ChannelQueryPersistanceACL,
    private readonly persistanceService: PersistanceService,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
  ) {}

  toPrismaFilter(
    filter: DatabaseFilter<Channel>,
    mode: 'many' | 'unique',
  ): Prisma.ChannelWhereInput | Prisma.ChannelWhereUniqueInput {
    const prismaFilter: Prisma.ChannelWhereInput | Prisma.ChannelWhereUniqueInput = {};

    (Object.keys(filter) as Array<keyof Channel>).forEach((key) => {
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
  async findOne(filter: DatabaseFilter<Channel>): Promise<ChannelQueryModel | null> {
    const findUserOperation = async () => {
      return await this.persistanceService.channel.findUnique({
        where: this.toPrismaFilter(filter, 'unique') as Prisma.ChannelWhereUniqueInput,
      });
    };

    const foundUser = await this.prismaDatabaseHandler.execute(findUserOperation, {
      operationType: 'CREATE',
      entry: {},
    });

    return foundUser ? this.queryPersistanceACL.toQueryModel(foundUser) : null;
  }

  async findMany(filter: DatabaseFilter<Channel>): Promise<ChannelQueryModel[]> {
    const findManyUsersOperation = async () => {
      return await this.persistanceService.channel.findMany({
        where: this.toPrismaFilter(filter, 'unique') as Prisma.ChannelWhereUniqueInput,
      });
    };

    const foundUsers = await this.prismaDatabaseHandler.execute(findManyUsersOperation, {
      operationType: 'CREATE',
      entry: {},
    });

    return foundUsers.map((user) => this.queryPersistanceACL.toQueryModel(user));
  }

  async findById(id: string): Promise<ChannelQueryModel | null> {
    const findUserByIdOperation = async () => {
      return await this.persistanceService.channel.findUnique({
        where: { id },
      });
    };

    const foundUser = await this.prismaDatabaseHandler.execute(findUserByIdOperation, {
      operationType: 'CREATE',
      entry: {},
    });

    return foundUser ? this.queryPersistanceACL.toQueryModel(foundUser) : null;
  }
}
