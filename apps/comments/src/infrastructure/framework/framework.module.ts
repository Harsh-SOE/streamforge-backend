import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';

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
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_STREAM_GROUPNAME,
  REDIS_STREAM_KEY,
  RedisClient,
} from '@app/clients/redis';
import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';

import {
  COMMENTS_BUFFER_PORT,
  COMMENTS_CACHE_PORT,
  COMMENTS_REPOSITORY_PORT,
} from '@comments/application/ports';

import { MeasureModule } from '../measure';
import { AppConfigService } from '../config';
import { RedisCacheAdapter } from '../cache/adapters';
import { WinstonLoggerAdapter } from '../logger/adapters';
import { RedisStreamBufferAdapter } from '../buffer/adapters';
import { CommentAggregatePersistance } from '../anti-corruption';
import { KafkaMessageBrokerAdapter } from '../message-broker/adapters';
import { PrismaMongoDBRepositoryAdapter } from '../repository/adapters';

import { PrismaClient as CommentsPrismaClient } from '@peristance/comments';

@Global()
@Module({
  imports: [MeasureModule, CqrsModule],
  providers: [
    AppConfigService,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    CommentAggregatePersistance,
    KafkaClient,
    RedisClient,
    PrismaDBClient,
    {
      provide: COMMENTS_REPOSITORY_PORT,
      useClass: PrismaMongoDBRepositoryAdapter,
    },
    { provide: COMMENTS_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: COMMENTS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
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
      provide: KAFKA_CLIENT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => configService.KAFKA_CLIENT_ID,
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
      useValue: CommentsPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'comments',
    },
  ],
  exports: [
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,

    CommentAggregatePersistance,
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,

    KafkaClient,
    RedisClient,
    PrismaDBClient,

    CqrsModule,
    MeasureModule,
    AppConfigService,

    COMMENTS_REPOSITORY_PORT,
    MESSAGE_BROKER,
    COMMENTS_CACHE_PORT,
    LOGGER_PORT,
    COMMENTS_BUFFER_PORT,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_HOST,
    KAFKA_PORT,
    KAFKA_CA_CERT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_STREAM_GROUPNAME,
    REDIS_STREAM_KEY,
  ],
})
export class FrameworkModule {}
