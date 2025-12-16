import { Global, Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  STORAGE_PORT,
  VIDEOS_BUFFER_PORT,
  VIDEOS_CACHE_PORT,
  VIDEOS_RESPOSITORY_PORT,
} from '@videos/application/ports';
import { MeasureModule } from '@videos/infrastructure/measure';
import { WinstonLoggerAdapter } from '@videos/infrastructure/logger';
import { VideoRedisClient } from '@videos/infrastructure/clients/redis';
import { VideosKafkaClient } from '@videos/infrastructure/clients/kafka';
import { VideoPrismaClient } from '@videos/infrastructure/clients/prisma';
import { RedisCacheAdapter } from '@videos/infrastructure/cache/adapters';
import { AwsS3StorageAdapter } from '@videos/infrastructure/storage/adapters';
import { RedisStreamBufferAdapter } from '@videos/infrastructure/buffer/adapters';
import { AppConfigModule, AppConfigService } from '@videos/infrastructure/config';
import { VideoRepositoryAdapter } from '@videos/infrastructure/repository/adapters';
import { VideoAggregatePersistanceACL } from '@videos/infrastructure/anti-corruption';
import { KafkaMessageBrokerAdapter } from '@videos/infrastructure/message-bus/adapters';

@Global()
@Module({
  imports: [MeasureModule, AppConfigModule],
  providers: [
    VideoAggregatePersistanceACL,
    RedisBufferHandler,
    RedisCacheHandler,
    VideoRedisClient,
    KafkaMessageBrokerHandler,
    VideosKafkaClient,
    AppConfigService,
    PrismaDatabaseHandler,
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
  ],
  exports: [
    MeasureModule,
    VideoAggregatePersistanceACL,
    AppConfigModule,
    AppConfigService,

    KafkaMessageBrokerHandler,
    VideosKafkaClient,

    RedisCacheHandler,
    RedisBufferHandler,
    VideoRedisClient,

    PrismaDatabaseHandler,
    VideoPrismaClient,

    VIDEOS_RESPOSITORY_PORT,
    VIDEOS_BUFFER_PORT,
    MESSAGE_BROKER,
    VIDEOS_CACHE_PORT,
    STORAGE_PORT,
    LOGGER_PORT,
  ],
})
export class FrameworkModule {}
