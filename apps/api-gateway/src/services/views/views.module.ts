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

import { WatchService } from './views.service';
import { WatchController } from './views.controller';

@Module({
  imports: [
    AppConfigModule,
    MeasureModule,
    ClientsModule.registerAsync([
      {
        name: SERVICES.WATCH,
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (configService: AppConfigService) =>
          configService.WATCH_SERVICE_OPTION,
      },
    ]),
  ],
  controllers: [WatchController],
  providers: [
    WatchService,
    { provide: LOGGER_PORT, useClass: WinstonLoggerAdapter },
  ],
})
export class WatchModule {}
