import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LOGGER_PORT } from '@app/ports/logger';

import {
  ProjectedChannelModel,
  ProjectedChannelSchema,
  ProjectedUserQueryModel,
  ProjectedVideoCardModel,
  ProjectedVideoCardSchema,
  ProjectUserQuerySchema,
} from '@projection/infrastructure/repository/models';
import {
  VIDEO_PROJECTION_BUFFER_PORT,
  USER_PROJECTION_REPOSITORY_PORT,
  VIDEO_PROJECTION_REPOSITORY_PORT,
} from '@projection/application/ports';
import { WinstonLoggerAdapter } from '@projection/infrastructure/logger';
import { VideoKafkaBufferAdapter } from '@projection/infrastructure/buffer/adapters';
import {
  UserCardRepository,
  VideoCardRepository,
} from '@projection/infrastructure/repository/adapters';
import {
  ChannelCardACL,
  UserCardACL,
  VideoCardACL,
} from '@projection/infrastructure/anti-corruption';
import { AppConfigModule, AppConfigService } from '@projection/infrastructure/config';
import { EventHandler } from '@projection/application/events/handlers';

import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.DATABASE_URL,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: ProjectedVideoCardModel.name,
        schema: ProjectedVideoCardSchema,
      },
      {
        name: ProjectedUserQueryModel.name,
        schema: ProjectUserQuerySchema,
      },
      {
        name: ProjectedChannelModel.name,
        schema: ProjectedChannelSchema,
      },
    ]),
  ],
  providers: [
    AppConfigService,
    KafkaService,
    VideoCardACL,
    ChannelCardACL,
    UserCardACL,
    ...EventHandler,
    {
      provide: VIDEO_PROJECTION_BUFFER_PORT,
      useClass: VideoKafkaBufferAdapter,
    },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
    {
      provide: VIDEO_PROJECTION_REPOSITORY_PORT,
      useClass: VideoCardRepository,
    },
    {
      provide: USER_PROJECTION_REPOSITORY_PORT,
      useClass: UserCardRepository,
    },
  ],
  controllers: [KafkaController],
  exports: [
    AppConfigService,
    VIDEO_PROJECTION_REPOSITORY_PORT,
    USER_PROJECTION_REPOSITORY_PORT,
    LOGGER_PORT,
    VIDEO_PROJECTION_BUFFER_PORT,
  ],
})
export class KafkaModule {}
