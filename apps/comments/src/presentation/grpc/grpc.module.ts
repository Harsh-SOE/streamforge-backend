import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { RedisBufferHandler } from '@app/handlers/buffer-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  COMMENTS_BUFFER_PORT,
  COMMENTS_CACHE_PORT,
  COMMENTS_REPOSITORY_PORT,
} from '@comments/application/ports';
import { CommentEventHandler } from '@comments/application/events';
import { CommentCommandHandler } from '@comments/application/commands';
import { AppConfigModule } from '@comments/infrastructure/config';
import { PrismaMongoDBRepositoryAdapter } from '@comments/infrastructure/repository/adapters';
import { KafkaMessageBrokerAdapter } from '@comments/infrastructure/message-broker/adapters';
import { RedisStreamBufferAdapter } from '@comments/infrastructure/buffer/adapters';
import { RedisCacheAdapter } from '@comments/infrastructure/cache/adapters';
import { WinstonLoggerAdapter } from '@comments/infrastructure/logger/adapters';
import { PersistanceService } from '@comments/infrastructure/persistance/adapter';
import { CommentAggregatePersistance } from '@comments/infrastructure/anti-corruption';

import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';

@Module({
  imports: [AppConfigModule, CqrsModule, ScheduleModule.forRoot()],
  controllers: [GrpcController],
  providers: [
    GrpcService,
    RedisBufferHandler,
    RedisCacheHandler,
    KafkaMessageBrokerHandler,
    PersistanceService,
    PrismaDatabaseHandler,
    CommentAggregatePersistance,
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
    ...CommentCommandHandler,
    ...CommentEventHandler,
  ],
})
export class GrpcModule {}
