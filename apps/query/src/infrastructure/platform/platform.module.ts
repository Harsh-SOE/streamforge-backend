import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LOGGER_PORT } from '@app/common/ports/logger';
import { LOKI_CONFIG, LokiConfig, LokiConsoleLogger } from '@app/utils/loki-console-logger';

import {
  CHANNEL_QUERY_REPOSITORY_PORT,
  USER_QUERY_REPOSITORY_PORT,
} from '@query/application/ports';

import {
  ChannelProjectionModel,
  ChannelProjectionSchema,
  UserProjectionModel,
  UserProjectionSchema,
} from '../repository/models';
import { QueryConfigModule, QueryConfigService } from '../config';
import { ChannelQueryACL, UserQueryACL } from '../anti-corruption';
import { ChannelProjectionRepository, UserQueryRepository } from '../repository/adapters';

@Global()
@Module({
  imports: [
    QueryConfigModule,
    MongooseModule.forRootAsync({
      imports: [QueryConfigModule],
      inject: [QueryConfigService],
      useFactory: (configService: QueryConfigService) => ({
        uri: configService.DATABASE_URL,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: UserProjectionModel.name,
        schema: UserProjectionSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ChannelProjectionModel.name,
        schema: ChannelProjectionSchema,
      },
    ]),
  ],
  providers: [
    QueryConfigService,
    UserQueryACL,
    ChannelQueryACL,
    {
      provide: LOKI_CONFIG,
      inject: [QueryConfigService],
      useFactory: (configService: QueryConfigService) =>
        ({ url: configService.GRAFANA_LOKI_URL }) satisfies LokiConfig,
    },
    {
      provide: USER_QUERY_REPOSITORY_PORT,
      useClass: UserQueryRepository,
    },
    {
      provide: CHANNEL_QUERY_REPOSITORY_PORT,
      useClass: ChannelProjectionRepository,
    },
    {
      provide: LOGGER_PORT,
      useClass: LokiConsoleLogger,
    },
  ],
  exports: [
    QueryConfigService,
    UserQueryACL,
    ChannelQueryACL,
    USER_QUERY_REPOSITORY_PORT,
    CHANNEL_QUERY_REPOSITORY_PORT,
    LOGGER_PORT,
  ],
})
export class PlatformModule {}
