import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import { PrismaClient } from '@peristance/videos';

export class VideoPrismaClient implements OnModuleInit, OnModuleDestroy {
  public readonly prismaClient = new PrismaClient();
  public readonly video = this.prismaClient.video;

  constructor(
    private readonly prismaDatabaseHandler: PrismaDatabaseHandler,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async onModuleInit() {
    const connectToDatabaseOperation = async () => await this.prismaClient.$connect();

    await this.prismaDatabaseHandler.execute(connectToDatabaseOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });
    this.logger.info(`Database connected successfully`);
  }

  public async onModuleDestroy() {
    const disconnectFromDatabaseOperation = async () => await this.prismaClient.$disconnect();

    await this.prismaDatabaseHandler.execute(disconnectFromDatabaseOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });
    this.logger.info(`Database disconnected successfully`);
  }
}
