import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { LOGGER_PORT } from '@app/ports/logger';
import { MESSAGE_BROKER } from '@app/ports/message-broker';
import { PrismaDatabaseHandler } from '@app/handlers/database-handler';
import { KafkaMessageBrokerHandler } from '@app/handlers/message-broker-handler';

import {
  USER_COMMAND_REROSITORY_PORT,
  USER_QUERY_REROSITORY_PORT,
  USERS_STORAGE_PORT,
} from '@users/application/ports';
import {
  AppConfigModule,
  AppConfigService,
} from '@users/infrastructure/config';
import { UserCommandHandlers } from '@users/application/commands';
import { UserQueryHandlers } from '@users/application/queries';
import { UserEventHandlers } from '@users/application/events';
import { MeasureModule } from '@users/infrastructure/measure';
import {
  UserQueryRepositoryAdapter,
  UserCommandRepositoryAdapter,
} from '@users/infrastructure/repository/adapters';
import {
  UserAggregatePersistanceACL,
  UserQueryPersistanceACL,
} from '@users/infrastructure/anti-corruption';
import { PersistanceService } from '@users/infrastructure/persistance/adapter';
import { KafkaMessageBrokerAdapter } from '@users/infrastructure/message-broker/adapters';
import { WinstonLoggerAdapter } from '@users/infrastructure/logger';
import { AwsS3StorageAdapter } from '@users/infrastructure/storage/adapters';

import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';

@Module({
  imports: [AppConfigModule, MeasureModule, CqrsModule],
  controllers: [GrpcController],
  providers: [
    GrpcService,
    PersistanceService,
    AppConfigService,
    UserAggregatePersistanceACL,
    UserQueryPersistanceACL,
    KafkaMessageBrokerHandler,
    PrismaDatabaseHandler,
    {
      provide: USER_COMMAND_REROSITORY_PORT,
      useClass: UserCommandRepositoryAdapter,
    },
    {
      provide: USER_QUERY_REROSITORY_PORT,
      useClass: UserQueryRepositoryAdapter,
    },
    {
      provide: MESSAGE_BROKER,
      useClass: KafkaMessageBrokerAdapter,
    },
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
    { provide: USERS_STORAGE_PORT, useClass: AwsS3StorageAdapter },
    ...UserCommandHandlers,
    ...UserEventHandlers,
    ...UserQueryHandlers,
  ],
})
export class GrpcModule {}
