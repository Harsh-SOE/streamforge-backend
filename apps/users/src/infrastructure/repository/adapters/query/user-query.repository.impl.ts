import { Injectable } from '@nestjs/common';

import { LogExecutionTime } from '@app/utils';
import { DatabaseFilter } from '@app/common/types';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { UserQueryRepositoryPort } from '@users/application/ports';
import { UserQueryModel } from '@users/application/queries';
import { PersistanceService } from '@users/infrastructure/persistance/adapter';
import { UserQueryPersistanceACL } from '@users/infrastructure/anti-corruption';

import { Prisma, User } from '@peristance/user';

@Injectable()
export class UserQueryRepositoryAdapter implements UserQueryRepositoryPort {
  constructor(
    private readonly queryPersistanceACL: UserQueryPersistanceACL,
    private readonly persistanceService: PersistanceService,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
  ) {}

  toPrismaFilter(
    filter: DatabaseFilter<User>,
    mode: 'many' | 'unique',
  ): Prisma.UserWhereInput | Prisma.UserWhereUniqueInput {
    const prismaFilter: Prisma.UserWhereInput | Prisma.UserWhereUniqueInput =
      {};

    (Object.keys(filter) as Array<keyof User>).forEach((key) => {
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
  async findOne(filter: DatabaseFilter<User>): Promise<UserQueryModel | null> {
    const findUserOperation = async () => {
      return await this.persistanceService.user.findUnique({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.UserWhereUniqueInput,
      });
    };

    const foundUser = await this.prismaDatabaseHandler.filter(
      findUserOperation,
      {
        operationType: 'CREATE',
        entry: {},
      },
    );

    return foundUser ? this.queryPersistanceACL.toQueryModel(foundUser) : null;
  }

  async findMany(filter: DatabaseFilter<User>): Promise<UserQueryModel[]> {
    const findManyUsersOperation = async () => {
      return await this.persistanceService.user.findMany({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.UserWhereUniqueInput,
      });
    };

    const foundUsers = await this.prismaDatabaseHandler.filter(
      findManyUsersOperation,
      {
        operationType: 'CREATE',
        entry: {},
      },
    );

    return foundUsers.map((user) =>
      this.queryPersistanceACL.toQueryModel(user),
    );
  }

  async findOneById(id: string): Promise<UserQueryModel | null> {
    const findUserByIdOperation = async () => {
      return await this.persistanceService.user.findUnique({
        where: { id },
      });
    };

    const foundUser = await this.prismaDatabaseHandler.filter(
      findUserByIdOperation,
      {
        operationType: 'CREATE',
        entry: {},
      },
    );

    return foundUser ? this.queryPersistanceACL.toQueryModel(foundUser) : null;
  }
}
