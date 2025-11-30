import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { RedisCacheHandler } from '@app/handlers/cache-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  REACTION_BUFFER_PORT,
  REACTION_CACHE_PORT,
  REACTION_DATABASE_PORT,
} from '@reaction/application/ports';
import {
  AppConfigService,
  AppConfigModule,
} from '@reaction/infrastructure/config';
import { RedisCacheAdapter } from '@reaction/infrastructure/cache/adapters';
import { ReactionRepositoryAdapter } from '@reaction/infrastructure/repository/adapters';
import { RedisStreamBufferAdapter } from '@reaction/infrastructure/buffer/adapters';
import { KafkaMessageBrokerAdapter } from '@reaction/infrastructure/message-broker/adapters';
import { LikeActionCommandHandler } from '@reaction/application/commands';
import { LikeQueriesHandler } from '@reaction/application/queries';
import { ReactionPersistanceACL } from '@reaction/infrastructure/anti-corruption';
import { WinstonLoggerAdapter } from '@reaction/infrastructure/logger';
import { PersistanceService } from '@reaction/infrastructure/persistance/adapter';

import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';

@Module({
  imports: [AppConfigModule, CqrsModule],
  controllers: [GrpcController],
  providers: [
    GrpcService,
    AppConfigService,
    ReactionPersistanceACL,
    RedisCacheHandler,
    KafkaMessageBrokerHandler,
    PrismaDatabaseHandler,
    PersistanceService,
    { provide: REACTION_DATABASE_PORT, useClass: ReactionRepositoryAdapter },
    { provide: REACTION_CACHE_PORT, useClass: RedisCacheAdapter },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: REACTION_BUFFER_PORT, useClass: RedisStreamBufferAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    ...LikeActionCommandHandler,
    ...LikeQueriesHandler,
  ],
})
export class GrpcModule {}
