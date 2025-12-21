import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
import { LOGGER_PORT } from '@app/ports/logger';
import { KafkaMessageBusHandler } from '@app/handlers/message-bus-handler';

import {
  CHANNEL_PROJECTION_REPOSITORY_PORT,
  USER_PROJECTION_REPOSITORY_PORT,
  PROJECTION_BUFFER_PORT,
  VIDEO_PROJECTION_REPOSITORY_PORT,
} from '@projection/application/ports';

import {
  ChannelProjectionModel,
  ChannelProjectionSchema,
  UserProjectionModel,
  VideoWatchProjectionModel,
  VideoWatchProjectionSchema,
  UserProjectionSchema,
} from '../repository/models';
import {
  ChannelProjectionRepository,
  UserProjectionRepository,
  VideoProjectionRepository,
} from '../repository/adapters';
import { WinstonLoggerAdapter } from '../logger';
import { KafkaBufferAdapter } from '../buffer/adapters';
import { AppConfigModule, AppConfigService } from '../config';
import { ChannelProjectionACL, UserProjectionACL, VideoProjectionACL } from '../anti-corruption';

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
        name: VideoWatchProjectionModel.name,
        schema: VideoWatchProjectionSchema,
      },
      {
        name: UserProjectionModel.name,
        schema: UserProjectionSchema,
      },
      {
        name: ChannelProjectionModel.name,
        schema: ChannelProjectionSchema,
      },
    ]),
  ],
  providers: [
    AppConfigService,
    VideoProjectionACL,
    ChannelProjectionACL,
    UserProjectionACL,
    KafkaClient,
    KafkaMessageBusHandler,
    {
      provide: PROJECTION_BUFFER_PORT,
      useClass: KafkaBufferAdapter,
    },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
    {
      provide: VIDEO_PROJECTION_REPOSITORY_PORT,
      useClass: VideoProjectionRepository,
    },
    {
      provide: USER_PROJECTION_REPOSITORY_PORT,
      useClass: UserProjectionRepository,
    },
    {
      provide: CHANNEL_PROJECTION_REPOSITORY_PORT,
      useClass: ChannelProjectionRepository,
    },
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
  ],
  exports: [
    AppConfigService,
    VideoProjectionACL,
    ChannelProjectionACL,
    UserProjectionACL,
    KafkaClient,
    KafkaMessageBusHandler,
    LOGGER_PORT,
    VIDEO_PROJECTION_REPOSITORY_PORT,
    USER_PROJECTION_REPOSITORY_PORT,
    PROJECTION_BUFFER_PORT,
    CHANNEL_PROJECTION_REPOSITORY_PORT,
    KAFKA_CLIENT,
    KAFKA_CONSUMER,
    KAFKA_HOST,
    KAFKA_PORT,
    KAFKA_CA_CERT,
    KAFKA_ACCESS_CERT,
    KAFKA_ACCESS_KEY,
  ],
})
export class FrameworkModule {}
