import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LOGGER_PORT } from '@app/ports/logger';

import {
  CHANNEL_QUERY_REPOSITORY_PORT,
  USER_QUERY_REPOSITORY_PORT,
} from '@query/application/ports';

import { AppConfigModule, AppConfigService } from '../config';
import { ChannelQueryACL, UserQueryACL } from '../anti-corruption';
import { ChannelQueryRepository, UserQueryRepository } from '../repository/adapters';
import { WinstonLoggerAdapter } from '../logger';
import {
  ProjectedChannelQueryModel,
  ProjectedChannelQuerySchema,
  ProjectedUserQueryModel,
  ProjectUserQuerySchema,
} from '../repository/models';

@Global()
@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.DATABASE_URL,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: ProjectedUserQueryModel.name,
        schema: ProjectUserQuerySchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: ProjectedChannelQueryModel.name,
        schema: ProjectedChannelQuerySchema,
      },
    ]),
  ],
  providers: [
    AppConfigService,
    UserQueryACL,
    ChannelQueryACL,
    {
      provide: USER_QUERY_REPOSITORY_PORT,
      useClass: UserQueryRepository,
    },
    {
      provide: CHANNEL_QUERY_REPOSITORY_PORT,
      useClass: ChannelQueryRepository,
    },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
  ],
  exports: [
    AppConfigService,
    UserQueryACL,
    ChannelQueryACL,
    USER_QUERY_REPOSITORY_PORT,
    CHANNEL_QUERY_REPOSITORY_PORT,
    LOGGER_PORT,
  ],
})
export class FrameworkModule {}
