import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { PrismaHandler } from '@app/handlers/database/prisma';

import { PRISMA_CLIENT, PRISMA_CLIENT_NAME } from './constants';

export interface IPrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}

@Injectable()
export class PrismaDBClient<T extends IPrismaClient> implements OnModuleInit, OnModuleDestroy {
  public client: T;

  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(PRISMA_CLIENT) private readonly clientConstructor: new () => T,
    @Inject(PRISMA_CLIENT_NAME) private readonly clientName: string,
    private readonly handler: PrismaHandler,
  ) {
    this.logger.alert(`${this.clientName} Prisma client connecting...`);
  }

  public async onModuleInit() {
    const intializePrismaClientOperation = () => {
      this.client = new this.clientConstructor();
    };

    const connectToDatabaseOperation = async () => await this.client.$connect();

    await this.handler.execute(intializePrismaClientOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });
    await this.handler.execute(connectToDatabaseOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.logger.alert(`${this.clientName} Prisma client connected successfully`);
  }

  public async onModuleDestroy() {
    const disconnectFromDatabaseOperation = async () => await this.client.$disconnect();

    await this.handler.execute(disconnectFromDatabaseOperation, {
      operationType: 'CONNECT_OR_DISCONNECT',
    });

    this.logger.alert(`${this.clientName} Prisma client disconnected successfully`);
  }
}
