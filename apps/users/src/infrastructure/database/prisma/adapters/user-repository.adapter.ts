import { Inject, Injectable } from '@nestjs/common';

import { PrismaDBClient } from '@app/clients/prisma';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PrismaHandler } from '@app/handlers/database/prisma';

import { UserAggregate } from '@users/domain/aggregates';
import { UserRepositoryPort } from '@users/application/ports';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClient } from '@persistance/users';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  public constructor(
    private userPersistanceACL: UserAggregatePersistanceACL,
    private readonly prismaDatabaseHandler: PrismaHandler,
    private readonly prisma: PrismaDBClient<PrismaClient>,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {
    this.logger.alert(`Using prisma for database connection for users service`);
  }

  public async saveOneUser(userAggregate: UserAggregate): Promise<UserAggregate> {
    const data = this.userPersistanceACL.toPersistance(userAggregate);
    const saveUserOperation = async () =>
      await this.prisma.client.user.create({
        data,
      });
    const createdUser = await this.prismaDatabaseHandler.execute(saveUserOperation, {
      operationType: 'CREATE',
      entity: this.userPersistanceACL.toPersistance(userAggregate),
    });
    return this.userPersistanceACL.toAggregate(createdUser);
  }

  public async saveManyUsers(userAggregates: UserAggregate[]): Promise<number> {
    if (!userAggregates || userAggregates.length === 0) {
      return 0;
    }

    const usersToCreate = userAggregates.map((model) =>
      this.userPersistanceACL.toPersistance(model),
    );

    const saveManyUsersOperations = async () =>
      await this.prisma.client.user.createMany({
        data: userAggregates.map((model) => this.userPersistanceACL.toPersistance(model)),
      });

    const createdEntities = await this.prismaDatabaseHandler.execute(saveManyUsersOperations, {
      operationType: 'CREATE',
      entity: usersToCreate,
    });
    return createdEntities.count;
  }

  async updateOneUserById(id: string, updatedUserModel: UserAggregate): Promise<UserAggregate> {
    const updateUserByIdOperation = async () =>
      await this.prisma.client.user.update({
        where: { id },
        data: this.userPersistanceACL.toPersistance(updatedUserModel),
      });

    const updatedUser = await this.prismaDatabaseHandler.execute(updateUserByIdOperation, {
      operationType: 'UPDATE',
      entity: this.userPersistanceACL.toPersistance(updatedUserModel),
      filter: { id },
    });

    return this.userPersistanceACL.toAggregate(updatedUser);
  }

  public async updateOneUserByAuthId(
    userAuthId: string,
    updatedUserAggregate: UserAggregate,
  ): Promise<UserAggregate> {
    const updateUserOperation = async () =>
      await this.prisma.client.user.update({
        where: { authUserId: userAuthId },
        data: this.userPersistanceACL.toPersistance(updatedUserAggregate),
      });

    const updatedUser = await this.prismaDatabaseHandler.execute(updateUserOperation, {
      operationType: 'UPDATE',
      entity: this.userPersistanceACL.toPersistance(updatedUserAggregate),
      filter: { authUserId: userAuthId },
    });

    return this.userPersistanceACL.toAggregate(updatedUser);
  }

  public async updateOneUserByHandle(
    handle: string,
    updatedUserAggregate: UserAggregate,
  ): Promise<UserAggregate> {
    const updateUserOperation = async () =>
      await this.prisma.client.user.update({
        where: { handle },
        data: this.userPersistanceACL.toPersistance(updatedUserAggregate),
      });

    const updatedUser = await this.prismaDatabaseHandler.execute(updateUserOperation, {
      operationType: 'UPDATE',
      entity: this.userPersistanceACL.toPersistance(updatedUserAggregate),
      filter: { handle },
    });

    return this.userPersistanceACL.toAggregate(updatedUser);
  }

  async deleteOneUserById(id: string): Promise<boolean> {
    const deleteUserByIdOperation = async () => {
      return await this.prisma.client.user.delete({
        where: { id },
      });
    };

    const deletedUser = await this.prismaDatabaseHandler.execute(deleteUserByIdOperation, {
      operationType: 'DELETE',
      filter: { id },
    });

    return deletedUser ? true : false;
  }

  public async deleteOneUserByAuthId(userAuthId: string): Promise<boolean> {
    const deleteUserByIdOperation = async () => {
      return await this.prisma.client.user.delete({
        where: { authUserId: userAuthId },
      });
    };

    const deletedUser = await this.prismaDatabaseHandler.execute(deleteUserByIdOperation, {
      operationType: 'DELETE',
      filter: { authUserId: userAuthId },
    });

    return deletedUser ? true : false;
  }

  public async deleteOneUserByHandle(userHandle: string): Promise<boolean> {
    const deleteUserByIdOperation = async () => {
      return await this.prisma.client.user.delete({
        where: { handle: userHandle },
      });
    };

    const deletedUser = await this.prismaDatabaseHandler.execute(deleteUserByIdOperation, {
      operationType: 'DELETE',
      filter: { handle: userHandle },
    });

    return deletedUser ? true : false;
  }

  async findOneUserById(id: string): Promise<UserAggregate | null> {
    const findUserByIdOperation = async () => {
      return await this.prisma.client.user.findUnique({
        where: { id },
      });
    };

    const foundUser = await this.prismaDatabaseHandler.execute(findUserByIdOperation, {
      operationType: 'READ',
      filter: { id },
    });

    return foundUser ? this.userPersistanceACL.toAggregate(foundUser) : null;
  }
}
