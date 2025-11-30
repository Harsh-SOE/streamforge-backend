import { Inject, Injectable } from '@nestjs/common';

import { DatabaseFilter } from '@app/common/types';
import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { UserAggregate } from '@users/domain/aggregates';
import { UserCommandRepositoryPort } from '@users/application/ports';
import { PersistanceService } from '@users/infrastructure/persistance/adapter';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption';

import { Prisma, User } from '@peristance/user';

@Injectable()
export class UserCommandRepositoryAdapter implements UserCommandRepositoryPort {
  public constructor(
    private userPersistanceACL: UserAggregatePersistanceACL,
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    private persistanceService: PersistanceService,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {}

  public toPrismaFilter(
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

  public async save(model: UserAggregate): Promise<UserAggregate> {
    const saveUserOperation = async () =>
      await this.persistanceService.user.create({
        data: this.userPersistanceACL.toPersistance(model),
      });
    const createdUser = await this.prismaDatabaseHandler.filter(
      saveUserOperation,
      {
        operationType: 'CREATE',
        entry: this.userPersistanceACL.toPersistance(model),
      },
    );
    return this.userPersistanceACL.toAggregate(createdUser);
  }

  public async saveMany(models: UserAggregate[]): Promise<number> {
    if (!models || models.length === 0) {
      return 0;
    }

    const usersToCreate = models.map((model) =>
      this.userPersistanceACL.toPersistance(model),
    );
    this.logger.info(
      `Saving: ${usersToCreate.length} documents into the database as a batch`,
      {
        component: Components.DATABASE,
        service: 'USERS',
      },
    );
    const saveManyUsersOperations = async () =>
      await this.persistanceService.user.createMany({
        data: models.map((model) =>
          this.userPersistanceACL.toPersistance(model),
        ),
      });

    const createdEntities = await this.prismaDatabaseHandler.filter(
      saveManyUsersOperations,
      { operationType: 'CREATE', entry: usersToCreate },
    );
    return createdEntities.count;
  }

  async updateOneById(
    id: string,
    updatedUserModel: UserAggregate,
  ): Promise<UserAggregate> {
    const updateUserByIdOperation = async () =>
      await this.persistanceService.user.update({
        where: { id },
        data: this.userPersistanceACL.toPersistance(updatedUserModel),
      });

    const updatedUser = await this.prismaDatabaseHandler.filter(
      updateUserByIdOperation,
      {
        operationType: 'UPDATE',
        entry: this.userPersistanceACL.toPersistance(updatedUserModel),
        filter: { id },
      },
    );

    return this.userPersistanceACL.toAggregate(updatedUser);
  }

  public async updateOne(
    filter: DatabaseFilter<User>,
    updatedUserModel: UserAggregate,
  ): Promise<UserAggregate> {
    const updateUserOperation = async () =>
      await this.persistanceService.user.update({
        where: this.toPrismaFilter(
          filter,
          'unique',
        ) as Prisma.UserWhereUniqueInput,
        data: this.userPersistanceACL.toPersistance(updatedUserModel),
      });

    const updatedUser = await this.prismaDatabaseHandler.filter(
      updateUserOperation,
      {
        operationType: 'UPDATE',
        entry: this.userPersistanceACL.toPersistance(updatedUserModel),
        filter,
      },
    );

    return this.userPersistanceACL.toAggregate(updatedUser);
  }

  public async updateMany(
    filter: DatabaseFilter<User>,
    updatedUserModel: UserAggregate,
  ): Promise<number> {
    const updateManyUsersOperation = async () =>
      await this.persistanceService.user.updateMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.UserWhereInput,
        data: this.userPersistanceACL.toPersistance(updatedUserModel),
      });

    const updatedUsers = await this.prismaDatabaseHandler.filter(
      updateManyUsersOperation,
      {
        operationType: 'UPDATE',
        entry: this.userPersistanceACL.toPersistance(updatedUserModel),
        filter,
      },
    );

    return updatedUsers.count;
  }

  async findOneById(id: string): Promise<UserAggregate | null> {
    const findUserByIdOperation = async () => {
      return await this.persistanceService.user.findUnique({
        where: { id },
      });
    };

    const foundUser = await this.prismaDatabaseHandler.filter(
      findUserByIdOperation,
      {
        operationType: 'READ',
        filter: { id },
      },
    );

    return foundUser ? this.userPersistanceACL.toAggregate(foundUser) : null;
  }

  async findOne(filter: DatabaseFilter<User>): Promise<UserAggregate | null> {
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
        operationType: 'READ',
        filter,
      },
    );

    return foundUser ? this.userPersistanceACL.toAggregate(foundUser) : null;
  }

  async findMany(filter: DatabaseFilter<User>): Promise<UserAggregate[]> {
    const findManyUsersOperation = async () => {
      return await this.persistanceService.user.findMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.UserWhereInput,
      });
    };

    const foundUsers = await this.prismaDatabaseHandler.filter(
      findManyUsersOperation,
      {
        operationType: 'READ',
        filter,
      },
    );

    return foundUsers.map((user) => this.userPersistanceACL.toAggregate(user));
  }

  async deleteOneById(id: string): Promise<boolean> {
    const deleteUserByIdOperation = async () => {
      return await this.persistanceService.user.delete({
        where: { id },
      });
    };

    const deletedUser = await this.prismaDatabaseHandler.filter(
      deleteUserByIdOperation,
      {
        operationType: 'DELETE',
        filter: { id },
      },
    );

    return deletedUser ? true : false;
  }

  async deleteOne(filter: DatabaseFilter<User>): Promise<boolean> {
    const deleteUserOperation = async () => {
      return await this.persistanceService.user.delete({
        where: this.toPrismaFilter(
          filter,
          'many',
        ) as Prisma.UserWhereUniqueInput,
      });
    };

    const deletedUser = await this.prismaDatabaseHandler.filter(
      deleteUserOperation,
      {
        operationType: 'DELETE',
        filter,
      },
    );

    return deletedUser ? true : false;
  }

  async deleteMany(filter: DatabaseFilter<User>): Promise<number> {
    const deleteManyUsersOperation = async () => {
      return await this.persistanceService.user.deleteMany({
        where: this.toPrismaFilter(filter, 'many') as Prisma.UserWhereInput,
      });
    };

    const deletedUsers = await this.prismaDatabaseHandler.filter(
      deleteManyUsersOperation,
      {
        operationType: 'DELETE',
        filter,
      },
    );

    return deletedUsers.count;
  }

  async markAsOnboarded(id: string): Promise<UserAggregate> {
    const userOnBoardedOperation = async () =>
      await this.persistanceService.user.update({
        where: this.toPrismaFilter(
          { id },
          'unique',
        ) as Prisma.UserWhereUniqueInput,
        data: {
          onBoardingComplete: true,
        },
      });

    const updatedUser = await this.prismaDatabaseHandler.filter(
      userOnBoardedOperation,
      {
        operationType: 'UPDATE',
        entry: {},
        filter: { id },
      },
    );

    return this.userPersistanceACL.toAggregate(updatedUser);
  }
}
