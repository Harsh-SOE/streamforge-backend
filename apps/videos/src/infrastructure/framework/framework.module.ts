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
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';
import { PRISMA_CLIENT, PRISMA_CLIENT_NAME, PrismaDBClient } from '@app/clients/prisma';

import {
  STORAGE_PORT,
  VIDEOS_BUFFER_PORT,
  VIDEOS_CACHE_PORT,
  VIDEOS_RESPOSITORY_PORT,
} from '@videos/application/ports';
import { MeasureModule } from '@videos/infrastructure/measure';
import { WinstonLoggerAdapter } from '@videos/infrastructure/logger';
import { RedisCacheAdapter } from '@videos/infrastructure/cache/adapters';
import { AwsS3StorageAdapter } from '@videos/infrastructure/storage/adapters';
import { RedisStreamBufferAdapter } from '@videos/infrastructure/buffer/adapters';
import { AppConfigModule, AppConfigService } from '@videos/infrastructure/config';
import { VideoRepositoryAdapter } from '@videos/infrastructure/repository/adapters';
import { VideoAggregatePersistanceACL } from '@videos/infrastructure/anti-corruption';
import { KafkaMessageBrokerAdapter } from '@videos/infrastructure/message-bus/adapters';

import { PrismaClient as VideoPrismaClient } from '@peristance/videos';

@Global()
@Module({
  imports: [MeasureModule, AppConfigModule],
  providers: [
    AppConfigService,
    VideoAggregatePersistanceACL,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisClient,
    KafkaClient,
    PrismaDBClient,
    VideoPrismaClient,
    {
      provide: VIDEOS_RESPOSITORY_PORT,
      useClass: VideoRepositoryAdapter,
    },
    { provide: VIDEOS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: VIDEOS_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: STORAGE_PORT, useClass: AwsS3StorageAdapter },
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
      useValue: VideoPrismaClient,
    },
    {
      provide: PRISMA_CLIENT_NAME,
      useValue: 'videos',
    },
  ],
  exports: [
    MeasureModule,
    VideoAggregatePersistanceACL,
    AppConfigModule,
    AppConfigService,

    KafkaMessageBusHandler,
    PrismaDatabaseHandler,
    RedisCacheHandler,
    RedisBufferHandler,

    VideoPrismaClient,
    KafkaClient,
    RedisClient,

    VIDEOS_RESPOSITORY_PORT,
    VIDEOS_BUFFER_PORT,
    MESSAGE_BROKER,
    VIDEOS_CACHE_PORT,
    STORAGE_PORT,
    LOGGER_PORT,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_STREAM_GROUPNAME,
    REDIS_STREAM_KEY,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_HOST,
    KAFKA_PORT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
    KAFKA_CA_CERT,
  ],
})
export class FrameworkModule {}
