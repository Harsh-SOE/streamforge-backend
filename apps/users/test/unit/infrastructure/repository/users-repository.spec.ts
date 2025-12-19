import { Test } from '@nestjs/testing';

import { LOGGER_PORT } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { PrismaDBClient } from '@app/clients/prisma';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClientMock, DatabaseHandlerMock } from '@test/users/mocks/infrastructure/repository';
import { UserACLMock } from '@test/users/mocks/infrastructure/acl';
import { LoggerMock } from '@test/users/mocks/infrastructure/logger';
import { persistedUserStub } from '@test/users/stubs/persistance';
import { UserAggregateStub } from '@test/users/stubs/aggregate';

describe('UserRepositoryAdapter', () => {
  let adapter: UserRepositoryAdapter;

  const prismaClientMock = PrismaClientMock();
  const databaseHandlerMock = DatabaseHandlerMock();
  const userACLMock = UserACLMock();
  const loggerMock = LoggerMock();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepositoryAdapter,
        { provide: PrismaDatabaseHandler, useValue: databaseHandlerMock },
        {
          provide: UserAggregatePersistanceACL,
          useValue: userACLMock,
        },
        {
          provide: LOGGER_PORT,
          useValue: loggerMock,
        },
        {
          provide: PrismaDBClient,
          useValue: prismaClientMock,
        },
      ],
    }).compile();

    adapter = module.get<UserRepositoryAdapter>(UserRepositoryAdapter);
  });

  afterEach(() => jest.clearAllMocks());

  describe('saveOneUser', () => {
    it('should convert aggregate, call prisma create, and return aggregate', async () => {
      const result = await adapter.saveOneUser(UserAggregateStub);

      expect(userACLMock.toPersistance).toHaveBeenCalledWith(UserAggregateStub);
      expect(databaseHandlerMock.execute).toHaveBeenCalled();
      expect(prismaClientMock.client.user.create).toHaveBeenCalledWith({
        data: persistedUserStub,
      });
      expect(result).toBe(UserAggregateStub);
    });
  });

  describe('saveManyUsers', () => {
    it('should convert aggregates, call prisma createMany, and return count', async () => {
      const result = await adapter.saveManyUsers([UserAggregateStub]);

      expect(userACLMock.toPersistance).toHaveBeenCalledTimes(2);
      expect(userACLMock.toPersistance).toHaveBeenCalledWith(UserAggregateStub);
      expect(databaseHandlerMock.execute).toHaveBeenCalledTimes(1);
      expect(prismaClientMock.client.user.createMany).toHaveBeenCalledWith({
        data: [persistedUserStub],
      });
      expect(result).toBe(1);
    });
  });
});
