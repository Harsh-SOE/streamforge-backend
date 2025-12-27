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
  REDIS_CACHE_CONFIG,
  RedisCacheHandler,
  RedisCacheHandlerConfig,
} from '@app/handlers/redis-cache-handler';
import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { LOKI_URL, LokiConsoleLogger } from '@app/utils/loki-console-logger';
import { DATABASE_CONFIG, DatabaseConfig, PrismaHandler } from '@app/handlers/database-handler';
import { KAFKA_CONFIG, KafkaHandler, KafkaHandlerConfig } from '@app/handlers/kafka-bus-handler';
import { REDIS_BUFFER_CONFIG, RedisBufferHandlerConfig } from '@app/handlers/redis-buffer-handler';

import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';

import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_STREAM_GROUPNAME,
  REDIS_STREAM_KEY,
  RedisClient,
} from '@app/clients/redis';
import { CHANNEL_REPOSITORY, CHANNEL_STORAGE_PORT } from '@channel/application/ports';

import { ChannelConfigModule, ChannelConfigService } from '../config';
import { AwsS3StorageAdapter } from '../storage/adapters';
import { KafkaMessageBusAdapter } from '../message-bus/adapters';
import { ChannelAggregatePersistanceACL } from '../anti-corruption';
import { ChannelRepositoryAdapter } from '../repository/adapters';

import { PrismaClient } from '@persistance/channel';

@Global()
@Module({
  imports: [ChannelConfigModule],
  providers: [
    ChannelConfigService,
    ChannelAggregatePersistanceACL,
    RedisCacheHandler,
    PrismaHandler,
    KafkaHandler,
    PrismaDBClient,
    KafkaClient,
    RedisClient,
    {
      provide: LOKI_URL,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.GRAFANA_LOKI_URL,
    },
    {
      provide: DATABASE_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.DATABASE_URL,
          service: 'channel',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies DatabaseConfig,
    },
    {
      provide: KAFKA_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.KAFKA_HOST,
          port: configService.KAFKA_PORT,
          service: 'channel',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies KafkaHandlerConfig,
    },
    {
      provide: REDIS_BUFFER_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'channel',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisBufferHandlerConfig,
    },
    {
      provide: REDIS_CACHE_CONFIG,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) =>
        ({
          host: configService.REDIS_HOST,
          port: configService.REDIS_PORT,
          service: 'channel',
          logErrors: true,
          resilienceOptions: { maxRetries: 3, circuitBreakerThreshold: 10, halfOpenAfterMs: 1500 },
        }) satisfies RedisCacheHandlerConfig,
    },
    {
      provide: CHANNEL_REPOSITORY,
      useClass: ChannelRepositoryAdapter,
    },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBusAdapter },
    { provide: CHANNEL_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    { provide: LOGGER_PORT, useClass: LokiConsoleLogger },
    {
      provide: KAFKA_HOST,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.KAFKA_HOST,
    },
    {
      provide: KAFKA_PORT,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.KAFKA_PORT,
    },
    {
      provide: KAFKA_CA_CERT,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.KAFKA_CA_CERT,
    },
    {
      provide: KAFKA_ACCESS_CERT,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.ACCESS_CERT,
    },
    {
      provide: KAFKA_ACCESS_KEY,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.ACCESS_KEY,
    },
    {
      provide: KAFKA_CLIENT,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.KAFKA_CLIENT_ID,
    },
    {
      provide: KAFKA_CONSUMER,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.KAFKA_CONSUMER_ID,
    },
    {
      provide: REDIS_HOST,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.REDIS_HOST,
    },
    {
      provide: REDIS_PORT,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.REDIS_PORT,
    },
    {
      provide: REDIS_STREAM_KEY,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.REDIS_STREAM_KEY,
    },
    {
      provide: REDIS_STREAM_GROUPNAME,
      inject: [ChannelConfigService],
      useFactory: (configService: ChannelConfigService) => configService.REDIS_STREAM_GROUPNAME,
    },
    {
      provide: PRISMA_CLIENT,
      useValue: PrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'channel',
    },
  ],
  exports: [
    ChannelConfigService,
    ChannelAggregatePersistanceACL,
    RedisCacheHandler,
    PrismaHandler,
    KafkaHandler,
    PrismaDBClient,
    KafkaClient,
    RedisClient,
    CHANNEL_REPOSITORY,
    MESSAGE_BROKER,
    CHANNEL_STORAGE_PORT,
    LOGGER_PORT,
    PRISMA_CLIENT,
    PRISMA_CLIENT_NAME,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_CA_CERT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
    KAFKA_HOST,
    KAFKA_PORT,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_STREAM_GROUPNAME,
    REDIS_STREAM_KEY,
  ],
})
export class FrameworkModule {}
