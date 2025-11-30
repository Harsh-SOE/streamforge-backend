import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { LOGGER_PORT } from '@app/ports/logger';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';

import {
  CHANNEL_COMMAND_REPOSITORY,
  CHANNEL_QUERY_REPOSITORY,
  CHANNEL_STORAGE_PORT,
} from '@channel/application/ports';
import { ChannelCommandHandlers } from '@channel/application/commands';
import { ChannelEventHandler } from '@channel/application/events';
import { ChannelQueryHandler } from '@channel/application/queries';
import { PersistanceService } from '@channel/infrastructure/persistance/adapter';
import { AppConfigService } from '@channel/infrastructure/config';
import {
  ChannelAggregatePersistanceACL,
  ChannelQueryPersistanceACL,
} from '@channel/infrastructure/anti-corruption';
import {
  ChannelCommandRepositoryAdapter,
  ChannelQueryRepositoryAdapter,
} from '@channel/infrastructure/repository/adapters';
import { KafkaMessageBrokerAdapter } from '@channel/infrastructure/message-broker/adapters';
import { AwsS3StorageAdapter } from '@channel/infrastructure/storage/adapters';
import { WinstonLoggerAdapter } from '@channel/infrastructure/logger';

import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';

@Module({
  imports: [CqrsModule],
  providers: [
    GrpcService,
    PersistanceService,
    AppConfigService,
    KafkaMessageBrokerHandler,
    ChannelAggregatePersistanceACL,
    PrismaDatabaseHandler,
    ChannelQueryPersistanceACL,
    {
      provide: CHANNEL_COMMAND_REPOSITORY,
      useClass: ChannelCommandRepositoryAdapter,
    },
    {
      provide: CHANNEL_QUERY_REPOSITORY,
      useClass: ChannelQueryRepositoryAdapter,
    },
    { provide: MESSAGE_BROKER, useClass: KafkaMessageBrokerAdapter },
    { provide: CHANNEL_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    ...ChannelCommandHandlers,
    ...ChannelEventHandler,
    ...ChannelQueryHandler,
  ],
  controllers: [GrpcController],
})
export class GrpcModule {}
