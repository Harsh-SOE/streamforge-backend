import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { LOGGER_PORT } from '@app/ports/logger';

import {
  AppConfigModule,
  AppConfigService,
} from '@query/infrastructure/config';
import {
  ProjectedUserQueryModel,
  ProjectUserQuerySchema,
} from '@query/infrastructure/repository/models';
import { QueryHandlers } from '@query/queries';
import { USER_QUERY_REPOSITORY_PORT } from '@query/application/ports';
import { UserQueryRepository } from '@query/infrastructure/repository/adapters';
import { WinstonLoggerAdapter } from '@query/infrastructure/logger';

import { GrpcService } from './grpc.service';
import { GrpcController } from './grpc.controller';

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
        name: ProjectedUserQueryModel.name,
        schema: ProjectUserQuerySchema,
      },
    ]),
  ],
  providers: [
    GrpcService,
    AppConfigService,
    ...QueryHandlers,
    {
      provide: USER_QUERY_REPOSITORY_PORT,
      useClass: UserQueryRepository,
    },
    {
      provide: LOGGER_PORT,
      useClass: WinstonLoggerAdapter,
    },
  ],
  controllers: [GrpcController],
})
export class GrpcModule {}
