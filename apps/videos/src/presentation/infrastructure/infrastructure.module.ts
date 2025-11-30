import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  AppConfigModule,
  AppConfigService,
} from '@videos/infrastructure/config';
import {
  VIDEOS_BUFFER_PORT,
  VIDEOS_CACHE_PORT,
  VIDEOS_COMMAND_RESPOSITORY_PORT,
  VIDEO_QUERY_RESPOSITORY_PORT,
  STORAGE_PORT,
} from '@videos/application/ports';
import {
  VideoCommandRepositoryAdapter,
  VideoQueryRepositoryAdapter,
} from '@videos/infrastructure/repository/adapters';
import { RedisStreamBufferAdapter } from '@videos/infrastructure/buffer/adapters';
import { KafkaMessageBrokerAdapter } from '@videos/infrastructure/message-broker/adapters';
import { RedisCacheAdapter } from '@videos/infrastructure/cache/adapters';
import { AwsS3StorageAdapter } from '@videos/infrastructure/storage/adapters';
import { WinstonLoggerAdapter } from '@videos/infrastructure/logger';
import { PersistanceService } from '@videos/infrastructure/persistance/adapter';
import {
  VideoAggregatePersistanceACL,
  VideoQueryPeristanceACL,
} from '@videos/infrastructure/anti-corruption';

@Global()
@Module({
  imports: [CqrsModule, AppConfigModule],
  providers: [
    VideoAggregatePersistanceACL,
    VideoQueryPeristanceACL,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBrokerHandler,
    AppConfigService,
    PersistanceService,
    PrismaDatabaseHandler,
    {
      provide: VIDEOS_COMMAND_RESPOSITORY_PORT,
      useClass: VideoCommandRepositoryAdapter,
    },
    {
      provide: VIDEO_QUERY_RESPOSITORY_PORT,
      useClass: VideoQueryRepositoryAdapter,
    },
    { provide: VIDEOS_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: VIDEOS_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: STORAGE_PORT, useClass: AwsS3StorageAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  exports: [
    VideoAggregatePersistanceACL,
    VideoQueryPeristanceACL,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBrokerHandler,
    AppConfigService,
    PersistanceService,
    PrismaDatabaseHandler,
    LOGGER_PORT,
    VIDEOS_BUFFER_PORT,
    VIDEOS_CACHE_PORT,
    MESSAGE_BROKER,
    STORAGE_PORT,
    VIDEOS_COMMAND_RESPOSITORY_PORT,
    VIDEO_QUERY_RESPOSITORY_PORT,
  ],
})
export class InfrastructureModule {}
