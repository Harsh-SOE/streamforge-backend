import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients';
import { LOGGER_PORT } from '@app/ports/logger';

import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';
import { MeasureModule } from '@gateway/infrastructure/measure';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

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
