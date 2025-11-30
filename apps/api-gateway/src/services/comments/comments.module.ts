import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients';

import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';
import { LOGGER_PORT } from '@gateway/application/ports';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { MeasureModule } from '@gateway/infrastructure/measure';

@Module({
  imports: [
    AppConfigModule,
    MeasureModule,
    ClientsModule.registerAsync([
      {
        imports: [AppConfigModule],
        inject: [AppConfigService],
        name: SERVICES.COMMENTS,
        useFactory: (configService: AppConfigService) =>
          configService.COMMENT_SERVICE_OPTIONS,
      },
    ]),
  ],
  providers: [
    CommentsService,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
