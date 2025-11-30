import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { SERVICES } from '@app/clients';

import {
  AppConfigModule,
  AppConfigService,
} from '@gateway/infrastructure/config';
import { LOGGER_PORT } from '@gateway/application/ports';
import { WinstonLoggerAdapter } from '@gateway/infrastructure/logger';

import { WatchService } from './views.service';
import { WatchController } from './views.controller';
import { MeasureModule } from '@gateway/infrastructure/measure';

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
