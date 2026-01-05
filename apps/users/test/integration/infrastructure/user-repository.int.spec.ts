import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

import {
  DATABASE_HANDLER_CONFIG,
  DatabaseConfig,
  PrismaHandler,
} from '@app/handlers/database/prisma';
import { LOGGER_PORT } from '@app/common/ports/logger';
import {
  DatabaseEntityAlreadyExistsException,
  DatabaseEntityDoesNotExistsException,
} from '@app/common/exceptions/payload/database-exceptions';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';

import {
  InvalidAvatarUrlException,
  InvalidEmailException,
  InvalidHandleException,
} from '@users/domain/exceptions';
import { UserAggregate } from '@users/domain/aggregates';
import { UserRepositoryAdapter } from '@users/infrastructure/repository/adapters';
import { UserAggregatePersistanceACL } from '@users/infrastructure/anti-corruption/aggregate-persistance-acl';

import { PrismaClient as UserPrismaClient } from '@persistance/users';

describe('UserRepositoryAdapter (Integration)', () => {
  let container: StartedPostgreSqlContainer;
  let adapter: UserRepositoryAdapter;

  jest.setTimeout(60000);

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:latest').start();

    const databaseUrl = container.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;

    console.log(`Applying migrations to database at: '${databaseUrl}'`);

    execSync(`npx prisma migrate deploy --schema apps/users/prisma/schema.prisma`, {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });

    console.log(`Migrations applied successfully`);
  });

  afterAll(async () => {
    await container.stop();
    console.log(`Test database shutdown successfully`);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryAdapter,
        UserAggregatePersistanceACL,
        PrismaHandler,
        PrismaDBClient,
        {
          provide: PRISMA_CLIENT,
          useValue: UserPrismaClient,
        },
        {
          provide: DATABASE_HANDLER_CONFIG,
          useFactory: () =>
            ({
              host: 'test-container',
              service: 'users',
              logErrors: true,
              resilienceOptions: {
                maxRetries: 3,
                circuitBreakerThreshold: 10,
                halfOpenAfterMs: 2_500,
              },
            }) satisfies DatabaseConfig,
        },
        {
          provide: PRISMA_CLIENT_NAME,
          useValue: 'users',
        },
        {
          provide: LOGGER_PORT,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            alert: jest.fn(),
            fatal: jest.fn(),
          },
        },
      ],
    }).compile();

    await module.init();

    const userPrismaClient = module.get(PrismaDBClient<UserPrismaClient>);
    await userPrismaClient.client.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE;`);

    adapter = module.get<UserRepositoryAdapter>(UserRepositoryAdapter);
  });

  describe('HandleInvalidUsers', () => {
    it('Should not save a invalid user in the database and throw relevant exceptions', () => {
      const createUserFromInvalidEmail = () =>
        UserAggregate.create({
          id: uuidv4(),
          userAuthId: 'testAuthId',
          handle: 'testHandle',
          email: 'invalidEmail',
          avatarUrl: 'https://testAvatar.com',
        });

      const createUserFromInvalidHandle = () =>
        UserAggregate.create({
          id: uuidv4(),
          userAuthId: 'testAuthId',
          handle: 'x',
          email: 'test@email.com',
          avatarUrl: 'https://testAvatar.com',
        });

      const createUserFromInvalidAvatar = () =>
        UserAggregate.create({
          id: uuidv4(),
          userAuthId: 'testAuthId',
          handle: 'testHandle',
          email: 'test@email.com',
          avatarUrl: 'invalidAvatarUrl',
        });

      expect(createUserFromInvalidEmail).toThrow(InvalidEmailException);
      expect(createUserFromInvalidHandle).toThrow(InvalidHandleException);
      expect(createUserFromInvalidAvatar).toThrow(InvalidAvatarUrlException);
    });
  });

  describe('saveOneUser', () => {
    it('should save a valid user in the database', async () => {
      const createValidUser = () =>
        UserAggregate.create({
          id: uuidv4(),
          userAuthId: 'testAuthId',
          handle: 'testHandle',
          email: 'test@email.com',
          avatarUrl: 'https://testAvatar.com',
        });

      expect(createValidUser()).toBeDefined();

      const user = createValidUser();

      const savedUser = await adapter.saveOneUser(user);

      expect(savedUser).toBeDefined();
      expect(savedUser.getUserSnapshot().id).toBe(user.getUserSnapshot().id);
      expect(savedUser.getUserSnapshot()).toEqual(user.getUserSnapshot());

      const foundUser = await adapter.findOneUserById(user.getUserSnapshot().id);

      expect(foundUser).toBeDefined();
      expect(foundUser!.getUserSnapshot().email).toBe(user.getUserSnapshot().email);
      expect(foundUser!.getUserSnapshot().handle).toBe(user.getUserSnapshot().handle);
      expect(foundUser!.getUserSnapshot()).toEqual(user.getUserSnapshot());
    });

    it(`should throw 'DatabaseEntityAlreadyExistsException' when a user with same id, authId, handle, email already exist`, async () => {
      const id = uuidv4();
      const originalUser = UserAggregate.create({
        id,
        userAuthId: 'test1AuthId',
        handle: 'test1Handle',
        email: 'test1@email.com',
        avatarUrl: 'https://test1Avatar.com',
      });

      // same email
      const userWithSameEmail = UserAggregate.create({
        id: uuidv4(),
        userAuthId: 'test2AuthId',
        handle: 'test2Handle',
        email: 'test1@email.com',
        avatarUrl: 'https://test2Avatar.com',
      });

      const userWithSameHandle = UserAggregate.create({
        id: uuidv4(),
        userAuthId: 'test3AuthId',
        handle: 'test1Handle',
        email: 'test3@email.com',
        avatarUrl: 'https://test3Avatar.com',
      });

      const userWithSameAuthId = UserAggregate.create({
        id: uuidv4(),
        userAuthId: 'test1AuthId',
        handle: 'test4Handle',
        email: 'test4@email.com',
        avatarUrl: 'https://test4Avatar.com',
      });

      const userWithSameId = UserAggregate.create({
        id,
        userAuthId: 'test5AuthId',
        handle: 'test5Handle',
        email: 'test5@email.com',
        avatarUrl: 'https://test5Avatar.com',
      });

      const savedFirstUser = await adapter.saveOneUser(originalUser);

      expect(savedFirstUser).toBeDefined();
      expect(savedFirstUser.getUserSnapshot().id).toBe(originalUser.getUserSnapshot().id);
      expect(savedFirstUser.getUserSnapshot()).toEqual(originalUser.getUserSnapshot());

      await expect(adapter.saveOneUser(userWithSameEmail)).rejects.toThrow(
        DatabaseEntityAlreadyExistsException,
      );
      await expect(adapter.saveOneUser(userWithSameHandle)).rejects.toThrow(
        DatabaseEntityAlreadyExistsException,
      );
      await expect(adapter.saveOneUser(userWithSameAuthId)).rejects.toThrow(
        DatabaseEntityAlreadyExistsException,
      );
      await expect(adapter.saveOneUser(userWithSameId)).rejects.toThrow(
        DatabaseEntityAlreadyExistsException,
      );
    });
  });

  describe('updateOneUserById', () => {
    it('should update a user when user was already present in the database', async () => {
      const user = UserAggregate.create({
        id: uuidv4(),
        userAuthId: 'testAuthId',
        handle: 'testHandle',
        email: 'test@email.com',
        avatarUrl: 'https://testAvatar.com',
      });

      const savedUser = await adapter.saveOneUser(user);

      expect(savedUser).toBeDefined();
      expect(savedUser.getUserSnapshot()).toEqual(user.getUserSnapshot());

      user.updateUserProfile({ avatar: 'https://updatedTestAvatar.com' });

      const updatedUser = await adapter.updateOneUserById(user.getUserSnapshot().id, user);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.getUserSnapshot()).toEqual(user.getUserSnapshot());
    });

    it(`should throw 'DatabaseEntityDoesNotExistsException' when the user was not present in the database`, async () => {
      const user = UserAggregate.create({
        id: uuidv4(),
        userAuthId: 'testAuthId',
        handle: 'testHandle',
        email: 'test@email.com',
        avatarUrl: 'https://testAvatar.com',
      });

      user.updateUserProfile({ avatar: 'https://updatedTestAvatar.com' });

      await expect(adapter.updateOneUserById(user.getUserSnapshot().id, user)).rejects.toThrow(
        DatabaseEntityDoesNotExistsException,
      );
    });
  });
});
