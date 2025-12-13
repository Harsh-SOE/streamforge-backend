import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { AppConfigService } from '@views/infrastructure/config';

import { Prisma, PrismaClient } from '@persistance/views';

@Injectable()
export class PersistanceService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  public constructor(
    private readonly configService: AppConfigService,
    @Inject(LOGGER_PORT) private logger: LoggerPort,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
      ],
    });
  }

  public async onModuleInit() {
    this.logger.info(`Prisma connecting to URL: ${this.configService.DATABASE_URL}`);

    this.$on('query', (e) => {
      this.logger.info('--- MongoDB Query Info Begins ---', {
        component: Components.DATABASE,
      });
      this.logger.info(`AGGREGATOR :: Operation: ${e.query}`, {
        component: Components.DATABASE,
      });
      this.logger.info(`AGGREGATOR :: Params: ${e.params}`, {
        component: Components.DATABASE,
      });
      this.logger.info(`AGGREGATOR :: Duration: ${e.duration}ms`, {
        component: Components.DATABASE,
      });
      this.logger.info('--- MongoDB Query Info Ends ---', {
        component: Components.DATABASE,
      });
    });

    await this.$connect();
    this.logger.info(`Database connected successfully`);
  }

  public async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info(`Database disconnected successfully`);
  }
}
