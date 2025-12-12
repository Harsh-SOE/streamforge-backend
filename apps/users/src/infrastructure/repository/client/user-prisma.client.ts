import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { LoggerPort } from '@app/ports/logger';

import { PrismaClient } from '@persistance/users';

@Injectable()
export class UserPrismaClient
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public constructor(
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    private readonly logger: LoggerPort,
  ) {
    super();
  }

  public async onModuleInit() {
    const connectToDatabaseOperation = async () => await this.$connect();

    await this.prismaDatabaseHandler.execute(connectToDatabaseOperation, {
      operationType: 'CONNECT',
    });
    this.logger.info(`Database connected successfully`);
  }

  public async onModuleDestroy() {
    const disconnectFromDatabaseOperation = async () =>
      await this.$disconnect();

    await this.prismaDatabaseHandler.execute(disconnectFromDatabaseOperation, {
      operationType: 'CONNECT',
    });
    this.logger.info(`Database disconnected successfully`);
  }
}
