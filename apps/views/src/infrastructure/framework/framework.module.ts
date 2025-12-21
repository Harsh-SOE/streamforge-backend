import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import {
  VIEWS_BUFFER_PORT,
  VIEWS_CACHE_PORT,
  VIEWS_REPOSITORY_PORT,
} from '@views/application/ports';

import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_STREAM_GROUPNAME,
  REDIS_STREAM_KEY,
  RedisClient,
} from '@app/clients/redis';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import {
  KAFKA_ACCESS_CERT,
  KAFKA_ACCESS_KEY,
  KAFKA_CA_CERT,
  KAFKA_CLIENT,
  KAFKA_CONSUMER,
  KAFKA_HOST,
  KAFKA_PORT,
  KafkaClient,
} from '@app/clients/kafka';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';

import { MeasureModule } from '../measure';
import { WinstonLoggerAdapter } from '../logger';
import { ViewCacheAdapter } from '../cache/adapters';
import { RedisStreamBufferAdapter } from '../buffer/adapters';
import { AppConfigModule, AppConfigService } from '../config';
import { ViewRepositoryAdapter } from '../repository/adapters';
import { ViewPeristanceAggregateACL } from '../anti-corruption';

import { PrismaClient as ViewPrismaClient } from '@persistance/views';

@Global()
@Module({
  imports: [MeasureModule, CqrsModule, AppConfigModule],
  providers: [
    ViewPeristanceAggregateACL,
    AppConfigService,
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,
    RedisBufferHandler,
    PrismaDBClient,
    KafkaClient,
    RedisClient,
    { provide: VIEWS_CACHE_PORT, useClass: ViewCacheAdapter },
    { provide: VIEWS_REPOSITORY_PORT, useClass: ViewRepositoryAdapter },
    { provide: VIEWS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    {
      provide: KAFKA_HOST,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_HOST,
    },
    {
      provide: KAFKA_PORT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_PORT,
    },
    {
      provide: KAFKA_CLIENT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CLIENT_ID,
    },
    {
      provide: KAFKA_CA_CERT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CA_CERT,
    },
    {
      provide: KAFKA_ACCESS_CERT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.ACCESS_CERT,
    },
    {
      provide: KAFKA_ACCESS_KEY,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.ACCESS_KEY,
    },
    {
      provide: KAFKA_CONSUMER,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CONSUMER_ID,
    },
    {
      provide: REDIS_HOST,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_HOST,
    },
    {
      provide: REDIS_PORT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_PORT,
    },
    {
      provide: REDIS_STREAM_KEY,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_STREAM_KEY,
    },
    {
      provide: REDIS_STREAM_GROUPNAME,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.REDIS_STREAM_GROUPNAME,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: ViewPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'views',
    },
  ],
  exports: [
    MeasureModule,
    CqrsModule,
    ViewPeristanceAggregateACL,

    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    VIEWS_CACHE_PORT,
    VIEWS_REPOSITORY_PORT,
    VIEWS_BUFFER_PORT,
    LOGGER_PORT,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_HOST,
    KAFKA_PORT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
    KAFKA_CA_CERT,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_STREAM_GROUPNAME,
    REDIS_STREAM_KEY,
    RedisClient,
  ],
})
export class FrameworkModule {}
